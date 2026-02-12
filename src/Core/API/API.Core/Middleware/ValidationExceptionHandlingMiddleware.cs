using System.Net;
using System.Text.Json;
using API.Core.Contracts.Common;
using FluentValidation;

namespace API.Core.Middleware;

public class ValidationExceptionHandlingMiddleware(RequestDelegate next)
{
   public async Task InvokeAsync(HttpContext context)
   {
      try
      {
         await next(context);
      }
      catch (ValidationException ex)
      {
         await HandleValidationExceptionAsync(context, ex);
      }
   }

   private static Task HandleValidationExceptionAsync(HttpContext context, ValidationException exception)
   {
      context.Response.ContentType = "application/json";
      context.Response.StatusCode = (int)HttpStatusCode.BadRequest;

      var errors = exception.Errors
          .Select(e => e.ErrorMessage)
          .ToList();

      var message = errors.Count == 1
          ? errors[0]
          : "Validation failed. " + string.Join(" ", errors);

      var response = new ResponseBody
      {
         Message = message
      };

      var jsonOptions = new JsonSerializerOptions
      {
         PropertyNamingPolicy = JsonNamingPolicy.CamelCase
      };

      return context.Response.WriteAsync(JsonSerializer.Serialize(response, jsonOptions));
   }
}
