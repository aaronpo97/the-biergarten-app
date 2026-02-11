using API.Core.Contracts.Common;
using FluentValidation;

namespace API.Core.Contracts.Auth;

public record LoginRequest
{
   public string Username { get; init; } = default!;
   public string Password { get; init; } = default!;
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
   public LoginRequestValidator()
   {
      RuleFor(x => x.Username)
          .NotEmpty().WithMessage("Username is required");

      RuleFor(x => x.Password)
          .NotEmpty().WithMessage("Password is required");
   }
}

