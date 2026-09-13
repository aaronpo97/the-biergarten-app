using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Moq;
using Shared.Application.Behaviors;

namespace Shared.Application.Tests.Behaviors;

public class ValidationBehaviorTests
{
    private static ValidationBehavior<ValidationTestRequest, ValidationTestResponse> CreateBehavior(
        params IValidator<ValidationTestRequest>[] validators
    ) => new(validators);

    [Fact]
    public async Task Handle_WhenRequestPassesAllValidators_InvokesNextUnchanged()
    {
        Mock<IValidator<ValidationTestRequest>> validatorMock = new();
        validatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        ValidationBehavior<ValidationTestRequest, ValidationTestResponse> behavior = CreateBehavior(
            validatorMock.Object
        );
        ValidationTestRequest request = new("aaron");
        ValidationTestResponse response = new("ok");
        bool nextInvoked = false;
        RequestHandlerDelegate<ValidationTestResponse> next = () =>
        {
            nextInvoked = true;
            return Task.FromResult(response);
        };

        ValidationTestResponse result = await behavior.Handle(
            request,
            next,
            CancellationToken.None
        );

        nextInvoked.Should().BeTrue();
        result.Should().BeSameAs(response);
    }

    [Fact]
    public async Task Handle_WhenValidatorReportsFailures_ThrowsValidationExceptionAndNeverInvokesNext()
    {
        ValidationFailure failure = new("Name", "is required");
        Mock<IValidator<ValidationTestRequest>> validatorMock = new();
        validatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([failure]));
        ValidationBehavior<ValidationTestRequest, ValidationTestResponse> behavior = CreateBehavior(
            validatorMock.Object
        );
        ValidationTestRequest request = new("");
        bool nextInvoked = false;
        RequestHandlerDelegate<ValidationTestResponse> next = () =>
        {
            nextInvoked = true;
            return Task.FromResult(new ValidationTestResponse("ok"));
        };

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<ValidationException>()).Which.Errors.Should()
            .ContainSingle()
            .Which.Should()
            .BeSameAs(failure);
        nextInvoked.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenMultipleValidatorsAreRegistered_RunsAllOfThem()
    {
        Mock<IValidator<ValidationTestRequest>> firstValidatorMock = new();
        firstValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        Mock<IValidator<ValidationTestRequest>> secondValidatorMock = new();
        secondValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        ValidationBehavior<ValidationTestRequest, ValidationTestResponse> behavior = CreateBehavior(
            firstValidatorMock.Object,
            secondValidatorMock.Object
        );
        ValidationTestRequest request = new("aaron");
        RequestHandlerDelegate<ValidationTestResponse> next = () =>
            Task.FromResult(new ValidationTestResponse("ok"));

        await behavior.Handle(request, next, CancellationToken.None);

        firstValidatorMock.Verify(
            v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Once()
        );
        secondValidatorMock.Verify(
            v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Once()
        );
    }

    [Fact]
    public async Task Handle_WhenMultipleValidatorsReportFailures_AggregatesErrorsFromAll()
    {
        ValidationFailure firstFailure = new("Name", "is required");
        ValidationFailure secondFailure = new("Name", "must be at least 3 characters");
        Mock<IValidator<ValidationTestRequest>> firstValidatorMock = new();
        firstValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([firstFailure]));
        Mock<IValidator<ValidationTestRequest>> secondValidatorMock = new();
        secondValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<ValidationTestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([secondFailure]));
        ValidationBehavior<ValidationTestRequest, ValidationTestResponse> behavior = CreateBehavior(
            firstValidatorMock.Object,
            secondValidatorMock.Object
        );
        ValidationTestRequest request = new("");
        RequestHandlerDelegate<ValidationTestResponse> next = () =>
            Task.FromResult(new ValidationTestResponse("ok"));

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<ValidationException>()).Which.Errors.Should()
            .BeEquivalentTo([firstFailure, secondFailure]);
    }

    [Fact]
    public async Task Handle_WhenNoValidatorsAreRegistered_InvokesNext()
    {
        ValidationBehavior<ValidationTestRequest, ValidationTestResponse> behavior = CreateBehavior();
        ValidationTestRequest request = new("aaron");
        ValidationTestResponse response = new("ok");
        RequestHandlerDelegate<ValidationTestResponse> next = () => Task.FromResult(response);

        ValidationTestResponse result = await behavior.Handle(
            request,
            next,
            CancellationToken.None
        );

        result.Should().BeSameAs(response);
    }
}

public record ValidationTestRequest(string Name) : IRequest<ValidationTestResponse>;

public record ValidationTestResponse(string Value);
