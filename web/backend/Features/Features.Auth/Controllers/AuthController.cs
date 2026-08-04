using Features.Auth.Commands.ConfirmUser;
using Features.Auth.Commands.RefreshToken;
using Features.Auth.Commands.RegisterUser;
using Features.Auth.Commands.ResendConfirmationEmail;
using Features.Auth.Dtos;
using Features.Auth.Queries.Login;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Features.Auth.Controllers;

/// <summary>
///     Handles user authentication concerns: registration, login, email confirmation, and token refresh.
/// </summary>
/// <remarks>
///     The controller is decorated with <c>[Authorize(AuthenticationSchemes = "JWT")]</c> by default, but most
///     actions opt out via <c>[AllowAnonymous]</c> since they are entry points used before a caller holds a token.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class AuthController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<ResponseBody<RegistrationPayload>>> Register(
        [FromBody] RegisterUserCommand command
    )
    {
        RegistrationPayload payload = await mediator.Send(command);
        return Created(
            "/",
            new ResponseBody<RegistrationPayload>
            {
                Message = "User registered successfully.",
                Payload = payload,
            }
        );
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ResponseBody<LoginPayload>>> Login([FromBody] LoginQuery query)
    {
        LoginPayload payload = await mediator.Send(query);
        return Ok(
            new ResponseBody<LoginPayload>
            {
                Message = "Logged in successfully.",
                Payload = payload,
            }
        );
    }

    [HttpPost("confirm")]
    public async Task<ActionResult<ResponseBody<ConfirmationPayload>>> Confirm(
        [FromQuery] string token
    )
    {
        ConfirmationPayload payload = await mediator.Send(new ConfirmUserCommand(token));
        return Ok(
            new ResponseBody<ConfirmationPayload>
            {
                Message = "User with ID " + payload.UserAccountId + " is confirmed.",
                Payload = payload,
            }
        );
    }

    [HttpPost("confirm/resend")]
    public async Task<ActionResult<ResponseBody>> ResendConfirmation([FromQuery] Guid userId)
    {
        await mediator.Send(new ResendConfirmationEmailCommand(userId));
        return Ok(new ResponseBody { Message = "confirmation email has been resent" });
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<ResponseBody<LoginPayload>>> Refresh(
        [FromBody] RefreshTokenCommand command
    )
    {
        LoginPayload payload = await mediator.Send(command);
        return Ok(
            new ResponseBody<LoginPayload>
            {
                Message = "Token refreshed successfully.",
                Payload = payload,
            }
        );
    }
}
