using FluentValidation;
using FluentValidation.Results;
using MediatR;

namespace Shared.Application.Behaviors;

/// <summary>
///     MediatR pipeline behavior that runs registered FluentValidation validators before the handler,
///     throwing <see cref="ValidationException" /> if any report failures.
/// </summary>
public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
{
    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken
    )
    {
        if (!validators.Any())
            return await next();

        ValidationContext<TRequest> context = new(request);

        List<ValidationFailure> failures = (
            await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, cancellationToken)))
        )
            .SelectMany(result => result.Errors)
            .Where(failure => failure != null)
            .ToList();

        if (failures.Count > 0)
            throw new ValidationException(failures);

        return await next();
    }
}
