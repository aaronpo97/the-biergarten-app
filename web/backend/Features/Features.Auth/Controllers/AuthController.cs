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
    /// <summary>Registers a new user account.</summary>
    /// <remarks>
    ///     Anonymous access. Returns 201 Created with the new account's ID, username, and issued tokens.
    ///     Returns 409 Conflict if the username or email is already taken.
    /// </remarks>
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

    /// <summary>Authenticates a user by username and password and issues a new access/refresh token pair.</summary>
    /// <remarks>
    ///     Anonymous access. Returns 200 OK with the tokens, or 401 Unauthorized if the credentials are invalid.
    /// </remarks>
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

    /// <summary>Confirms a user account using a confirmation token.</summary>
    /// <remarks>
    ///     Requires a valid JWT bearer token (no <c>[AllowAnonymous]</c> override). Returns 200 OK on success,
    ///     or 401 Unauthorized if <paramref name="token" /> is invalid or expired.
    /// </remarks>
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

    /// <summary>Resends the account confirmation email for the given user, generating a fresh confirmation token.</summary>
    /// <remarks>
    ///     Requires a valid JWT bearer token (no <c>[AllowAnonymous]</c> override). Always returns 200 OK, even
    ///     if <paramref name="userId" /> does not exist or the account is already confirmed, to avoid user
    ///     enumeration.
    /// </remarks>
    [HttpPost("confirm/resend")]
    public async Task<ActionResult<ResponseBody>> ResendConfirmation([FromQuery] Guid userId)
    {
        await mediator.Send(new ResendConfirmationEmailCommand(userId));
        return Ok(new ResponseBody { Message = "confirmation email has been resent" });
    }

    /// <summary>Exchanges a valid refresh token for a new access/refresh token pair.</summary>
    /// <remarks>
    ///     Anonymous access. Returns 200 OK with the new tokens, or 401 Unauthorized if the refresh token is
    ///     invalid or expired.
    /// </remarks>
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
