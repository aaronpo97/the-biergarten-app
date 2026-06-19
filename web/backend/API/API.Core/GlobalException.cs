// API.Core/Filters/GlobalExceptionFilter.cs

using API.Core.Contracts.Common;
using Domain.Exceptions;
using FluentValidation;
using Microsoft.Data.SqlClient;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Core;

/// <summary>
/// MVC exception filter that converts unhandled exceptions raised by controller actions into
/// consistent JSON error responses with appropriate HTTP status codes.
/// </summary>
/// <param name="logger">Logger used to record unhandled exceptions before they are translated into a response.</param>
public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    : IExceptionFilter
{
    /// <summary>
    /// Logs the exception and sets <see cref="ExceptionContext.Result"/> to an appropriate error response,
    /// marking the exception as handled.
    /// </summary>
    /// <remarks>
    /// Maps exception types to responses as follows:
    /// <list type="bullet">
    /// <item><description><see cref="FluentValidation.ValidationException"/> → <c>400 Bad Request</c> with per-property validation error messages.</description></item>
    /// <item><description><see cref="ConflictException"/> → <c>409 Conflict</c> with a <see cref="ResponseBody"/> message.</description></item>
    /// <item><description><see cref="NotFoundException"/> → <c>404 Not Found</c> with a <see cref="ResponseBody"/> message.</description></item>
    /// <item><description><see cref="UnauthorizedException"/> → <c>401 Unauthorized</c> with a <see cref="ResponseBody"/> message.</description></item>
    /// <item><description><see cref="ForbiddenException"/> → <c>403 Forbidden</c> with a <see cref="ResponseBody"/> message.</description></item>
    /// <item><description><see cref="SqlException"/> → <c>503 Service Unavailable</c> with a generic database error message.</description></item>
    /// <item><description><see cref="Domain.Exceptions.ValidationException"/> → <c>400 Bad Request</c> with a <see cref="ResponseBody"/> message.</description></item>
    /// <item><description>Any other exception → <c>500 Internal Server Error</c> with a generic error message.</description></item>
    /// </list>
    /// </remarks>
    /// <param name="context">The context for the unhandled exception, including the exception itself and the result to populate.</param>
    public void OnException(ExceptionContext context)
    {
        logger.LogError(context.Exception, "Unhandled exception occurred");

        switch (context.Exception)
        {
            case FluentValidation.ValidationException fluentValidationException:
                var errors = fluentValidationException
                    .Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(
                        g => g.Key,
                        g => g.Select(e => e.ErrorMessage).ToArray()
                    );

                context.Result = new BadRequestObjectResult(
                    new { message = "Validation failed", errors }
                );
                context.ExceptionHandled = true;
                break;

            case ConflictException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = ex.Message }
                )
                {
                    StatusCode = 409,
                };
                context.ExceptionHandled = true;
                break;

            case NotFoundException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = ex.Message }
                )
                {
                    StatusCode = 404,
                };
                context.ExceptionHandled = true;
                break;

            case UnauthorizedException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = ex.Message }
                )
                {
                    StatusCode = 401,
                };
                context.ExceptionHandled = true;
                break;

            case ForbiddenException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = ex.Message }
                )
                {
                    StatusCode = 403,
                };
                context.ExceptionHandled = true;
                break;

            case SqlException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = "A database error occurred." }
                )
                {
                    StatusCode = 503,
                };
                context.ExceptionHandled = true;
                break;

            case Domain.Exceptions.ValidationException ex:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = ex.Message }
                )
                {
                    StatusCode = 400,
                };
                context.ExceptionHandled = true;
                break;

            default:
                context.Result = new ObjectResult(
                    new ResponseBody
                    {
                        Message = "An unexpected error occurred",
                    }
                )
                {
                    StatusCode = 500,
                };
                context.ExceptionHandled = true;
                break;
        }
    }
}
