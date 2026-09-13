using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Moq;
using Shared.Application.Behaviors;

namespace Shared.Application.Tests.Behaviors;

public class ValidationBehaviorTests
{
    private static ValidationBehavior<TestRequest, TestResponse> CreateBehavior(
        params IValidator<TestRequest>[] validators
    ) => new(validators);

    [Fact]
    public async Task Handle_WhenRequestPassesAllValidators_InvokesNextUnchanged()
    {
        Mock<IValidator<TestRequest>> validatorMock = new();
        validatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        ValidationBehavior<TestRequest, TestResponse> behavior = CreateBehavior(
            validatorMock.Object
        );
        TestRequest request = new("aaron", "pa$$word123");
        TestResponse response = new("ok");
        bool nextInvoked = false;
        RequestHandlerDelegate<TestResponse> next = () =>
        {
            nextInvoked = true;
            return Task.FromResult(response);
        };

        TestResponse result = await behavior.Handle(
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
        ValidationFailure failure = new("Username", "is required");
        Mock<IValidator<TestRequest>> validatorMock = new();
        validatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([failure]));
        ValidationBehavior<TestRequest, TestResponse> behavior = CreateBehavior(
            validatorMock.Object
        );
        TestRequest request = new("", "pa$$word123");
        bool nextInvoked = false;
        RequestHandlerDelegate<TestResponse> next = () =>
        {
            nextInvoked = true;
            return Task.FromResult(new TestResponse("ok"));
        };

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<ValidationException>())
            .Which.Errors.Should()
            .ContainSingle()
            .Which.Should()
            .BeSameAs(failure);
        nextInvoked.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_WhenMultipleValidatorsAreRegistered_RunsAllOfThem()
    {
        Mock<IValidator<TestRequest>> firstValidatorMock = new();
        firstValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        Mock<IValidator<TestRequest>> secondValidatorMock = new();
        secondValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult());
        ValidationBehavior<TestRequest, TestResponse> behavior = CreateBehavior(
            firstValidatorMock.Object,
            secondValidatorMock.Object
        );
        TestRequest request = new("aaron", "pa$$word123");
        RequestHandlerDelegate<TestResponse> next = () =>
            Task.FromResult(new TestResponse("ok"));

        await behavior.Handle(request, next, CancellationToken.None);

        firstValidatorMock.Verify(
            v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Once()
        );
        secondValidatorMock.Verify(
            v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                ),
            Times.Once()
        );
    }

    [Fact]
    public async Task Handle_WhenMultipleValidatorsReportFailures_AggregatesErrorsFromAll()
    {
        ValidationFailure firstFailure = new("Username", "is required");
        ValidationFailure secondFailure = new("Username", "must be at least 3 characters");
        Mock<IValidator<TestRequest>> firstValidatorMock = new();
        firstValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([firstFailure]));
        Mock<IValidator<TestRequest>> secondValidatorMock = new();
        secondValidatorMock
            .Setup(v =>
                v.ValidateAsync(
                    It.IsAny<ValidationContext<TestRequest>>(),
                    It.IsAny<CancellationToken>()
                )
            )
            .ReturnsAsync(new ValidationResult([secondFailure]));
        ValidationBehavior<TestRequest, TestResponse> behavior = CreateBehavior(
            firstValidatorMock.Object,
            secondValidatorMock.Object
        );
        TestRequest request = new("", "pa$$word123");
        RequestHandlerDelegate<TestResponse> next = () =>
            Task.FromResult(new TestResponse("ok"));

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<ValidationException>())
            .Which.Errors.Should()
            .BeEquivalentTo([firstFailure, secondFailure]);
    }

    [Fact]
    public async Task Handle_WhenNoValidatorsAreRegistered_InvokesNext()
    {
        ValidationBehavior<TestRequest, TestResponse> behavior =
            CreateBehavior();
        TestRequest request = new("aaron", "pa$$word123");
        TestResponse response = new("ok");
        RequestHandlerDelegate<TestResponse> next = () => Task.FromResult(response);

        TestResponse result = await behavior.Handle(
            request,
            next,
            CancellationToken.None
        );

        result.Should().BeSameAs(response);
    }
}
