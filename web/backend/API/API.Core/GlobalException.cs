using Domain.Exceptions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Data.SqlClient;
using Shared.Contracts;
using ValidationException = FluentValidation.ValidationException;

namespace API.Core;

/// <summary>
///     MVC exception filter that converts unhandled exceptions raised by controller actions into
///     consistent JSON error responses with appropriate HTTP status codes.
/// </summary>
public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger) : IExceptionFilter
{
   /// <summary>
   ///     Logs the exception and sets <see cref="ExceptionContext.Result" /> to an appropriate error response.
   /// </summary>
   /// <remarks>
   ///     Maps <see cref="ValidationException" /> to 400, <see cref="ConflictException" /> to 409,
   ///     <see cref="NotFoundException" /> to 404, <see cref="UnauthorizedException" /> to 401,
   ///     <see cref="ForbiddenException" /> to 403, <see cref="SqlException" /> to 503,
   ///     <see cref="Domain.Exceptions.ValidationException" /> to 400, and anything else to 500.
   /// </remarks>
   public void OnException(ExceptionContext context)
    {
        logger.LogError(context.Exception, "Unhandled exception occurred");

        switch (context.Exception)
        {
            case ValidationException fluentValidationException:
                Dictionary<string, string[]> errors = fluentValidationException
                    .Errors.GroupBy(e => e.PropertyName)
                    .ToDictionary(g => g.Key, g => g.Select(e => e.ErrorMessage).ToArray());

                context.Result = new BadRequestObjectResult(
                    new { message = "Validation failed", errors }
                );
                context.ExceptionHandled = true;
                break;

            case ConflictException ex:
                context.Result = new ObjectResult(new ResponseBody { Message = ex.Message })
                {
                    StatusCode = 409,
                };
                context.ExceptionHandled = true;
                break;

            case NotFoundException ex:
                context.Result = new ObjectResult(new ResponseBody { Message = ex.Message })
                {
                    StatusCode = 404,
                };
                context.ExceptionHandled = true;
                break;

            case UnauthorizedException ex:
                context.Result = new ObjectResult(new ResponseBody { Message = ex.Message })
                {
                    StatusCode = 401,
                };
                context.ExceptionHandled = true;
                break;

            case ForbiddenException ex:
                context.Result = new ObjectResult(new ResponseBody { Message = ex.Message })
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
                context.Result = new ObjectResult(new ResponseBody { Message = ex.Message })
                {
                    StatusCode = 400,
                };
                context.ExceptionHandled = true;
                break;

            default:
                context.Result = new ObjectResult(
                    new ResponseBody { Message = "An unexpected error occurred" }
                )
                {
                    StatusCode = 500,
                };
                context.ExceptionHandled = true;
                break;
        }
    }
}
