using FluentAssertions;
using FluentValidation;
using FluentValidation.Results;
using MediatR;
using Microsoft.Extensions.Logging;
using Moq;
using Shared.Application.Behaviors;

namespace Shared.Application.Tests.Behaviors;

public class UnhandledExceptionLoggingBehaviorTests
{
    private readonly Mock<
        ILogger<UnhandledExceptionLoggingBehavior<TestRequest, TestResponse>>
    > _loggerMock = new();

    private UnhandledExceptionLoggingBehavior<TestRequest, TestResponse> CreateBehavior()
    {
        _loggerMock.Setup(l => l.IsEnabled(LogLevel.Error)).Returns(true);
        return new(_loggerMock.Object);
    }

    [Fact]
    public async Task Handle_WhenHandlerThrowsGenericException_LogsOnceAndRethrows()
    {
        UnhandledExceptionLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior();
        TestRequest request = new("aaron", "pa$$word123");
        InvalidOperationException thrown = new("Something went wrong.");
        RequestHandlerDelegate<TestResponse> next = () => throw thrown;

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<InvalidOperationException>())
            .Which.Should()
            .BeSameAs(thrown);
        VerifyLogError(Times.Once());
    }

    [Fact]
    public async Task Handle_WhenValidationExceptionThrown_DoesNotLogAndRethrows()
    {
        UnhandledExceptionLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior();
        TestRequest request = new("aaron", "pa$$word123");
        ValidationException thrown = new([new ValidationFailure("Username", "is required")]);
        RequestHandlerDelegate<TestResponse> next = () => throw thrown;

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);

        (await act.Should().ThrowAsync<ValidationException>()).Which.Should().BeSameAs(thrown);
        VerifyLogError(Times.Never());
    }

    [Fact]
    public async Task Handle_WhenHandlerSucceeds_DoesNotLogAndReturnsResponse()
    {
        UnhandledExceptionLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior();
        TestRequest request = new("aaron", "pa$$word123");
        TestResponse response = new("ok");
        RequestHandlerDelegate<TestResponse> next = () => Task.FromResult(response);

        TestResponse result = await behavior.Handle(request, next, CancellationToken.None);

        result.Should().BeSameAs(response);
        VerifyLogError(Times.Never());
    }

    [Fact]
    public async Task Handle_WhenHandlerThrows_RedactsSensitiveFieldsInLoggedPayload()
    {
        UnhandledExceptionLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior();
        TestRequest request = new("aaron", "pa$$word123");
        RequestHandlerDelegate<TestResponse> next = () =>
            throw new InvalidOperationException("Something went wrong.");

        Func<Task> act = async () => await behavior.Handle(request, next, CancellationToken.None);
        await act.Should().ThrowAsync<InvalidOperationException>();

        string loggedMessage = CaptureLoggedMessage();
        loggedMessage.Should().Contain("aaron").And.NotContain("pa$$word123");
    }

    private void VerifyLogError(Times times) =>
        _loggerMock.Verify(
            l =>
                l.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()
                ),
            times
        );

    private string CaptureLoggedMessage()
    {
        IInvocation? invocation = _loggerMock
            .Invocations.Where(i => i.Method.Name == nameof(ILogger.Log))
            .Should()
            .ContainSingle()
            .Subject;

        object state = invocation.Arguments[2];
        object exception = invocation.Arguments[3];
        object formatter = invocation.Arguments[4];
        System.Reflection.MethodInfo invokeMethod = formatter.GetType().GetMethod("Invoke")!;

        return (string)invokeMethod.Invoke(formatter, [state, exception])!;
    }
}
