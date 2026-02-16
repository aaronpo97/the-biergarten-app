// API.Core/Filters/GlobalExceptionFilter.cs

using API.Core.Contracts.Common;
using Domain.Exceptions;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;

namespace API.Core;

public class GlobalExceptionFilter(ILogger<GlobalExceptionFilter> logger)
    : IExceptionFilter
{
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
