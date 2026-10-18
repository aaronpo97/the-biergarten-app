using FluentAssertions;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using Shared.Application.Behaviors;

namespace Shared.Application.Tests.Behaviors;

public class PerformanceLoggingBehaviorTests
{
    private readonly Mock<
        ILogger<PerformanceLoggingBehavior<TestRequest, TestResponse>>
    > _loggerMock = new();

    private PerformanceLoggingBehavior<TestRequest, TestResponse> CreateBehavior(
        int thresholdMs = 500
    )
    {
        _loggerMock.Setup(l => l.IsEnabled(LogLevel.Warning)).Returns(true);
        Mock<IOptionsMonitor<PerformanceLoggingOptions>> optionsMock = new();
        optionsMock
            .Setup(o => o.CurrentValue)
            .Returns(new PerformanceLoggingOptions { SlowRequestThresholdMs = thresholdMs });
        return new(_loggerMock.Object, optionsMock.Object);
    }

    [Fact]
    public async Task Handle_WhenRequestIsBelowThreshold_DoesNotLogAndReturnsResponse()
    {
        PerformanceLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior();
        TestResponse response = new("ok");
        Task<TestResponse> next(CancellationToken _ = default) => Task.FromResult(response);

        TestResponse result = await behavior.Handle(
            new TestRequest("aaron", "pa$$word123"),
            next,
            CancellationToken.None
        );

        result.Should().BeSameAs(response);
        VerifyLogWarning(Times.Never());
    }

    [Fact]
    public async Task Handle_WhenRequestIsAtOrAboveThreshold_LogsWarningWithRequestNameAndDuration()
    {
        PerformanceLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior(50);
        async Task<TestResponse> next(CancellationToken _ = default)
        {
            await Task.Delay(100);
            return new TestResponse("ok");
        }

        await behavior.Handle(
            new TestRequest("aaron", "pa$$word123"),
            next,
            CancellationToken.None
        );

        VerifyLogWarning(Times.Once());
        string message = CaptureLoggedMessage();
        message.Should().Contain(nameof(TestRequest)).And.Contain("ms");
    }

    [Fact]
    public async Task Handle_WhenCustomThresholdIsLowerThanDefault_LogsRequestBetweenThem()
    {
        PerformanceLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior(10);
        async Task<TestResponse> next(CancellationToken _ = default)
        {
            await Task.Delay(100);
            return new TestResponse("ok");
        }

        await behavior.Handle(
            new TestRequest("aaron", "pa$$word123"),
            next,
            CancellationToken.None
        );

        VerifyLogWarning(Times.Once());
    }

    [Fact]
    public async Task Handle_WhenHandlerThrows_RethrowsUnchangedAndStillLogsSlowRequest()
    {
        PerformanceLoggingBehavior<TestRequest, TestResponse> behavior = CreateBehavior(10);
        InvalidOperationException thrown = new("Something went wrong.");
        async Task<TestResponse> next(CancellationToken _ = default)
        {
            await Task.Delay(100);
            throw thrown;
        }

        Func<Task> act = async () =>
            await behavior.Handle(
                new TestRequest("aaron", "pa$$word123"),
                next,
                CancellationToken.None
            );

        (await act.Should().ThrowAsync<InvalidOperationException>())
            .Which.Should()
            .BeSameAs(thrown);
        VerifyLogWarning(Times.Once());
    }

    private void VerifyLogWarning(Times times) =>
        _loggerMock.Verify(
            l =>
                l.Log(
                    LogLevel.Warning,
                    It.IsAny<EventId>(),
                    It.IsAny<It.IsAnyType>(),
                    It.IsAny<Exception>(),
                    It.IsAny<Func<It.IsAnyType, Exception?, string>>()
                ),
            times
        );

    private string CaptureLoggedMessage()
    {
        IInvocation invocation = _loggerMock
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
