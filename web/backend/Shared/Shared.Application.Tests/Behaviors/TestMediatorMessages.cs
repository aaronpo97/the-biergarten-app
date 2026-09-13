using MediatR;

namespace Shared.Application.Tests.Behaviors;

// ReSharper disable NotAccessedPositionalProperty.Global
public sealed record TestRequest(string Username, string Password) : IRequest<TestResponse>;

public sealed record TestResponse(string Value);
// ReSharper restore NotAccessedPositionalProperty.Global
