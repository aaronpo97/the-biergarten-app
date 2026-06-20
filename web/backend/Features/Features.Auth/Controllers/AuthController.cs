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
/// <param name="mediator">Used to dispatch auth commands and queries to their handlers.</param>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class AuthController(IMediator mediator) : ControllerBase
{
    /// <summary>
    ///     Registers a new user account.
    /// </summary>
    /// <remarks>
    ///     Allows anonymous access. On success, responds with <c>201 Created</c> containing the new user's ID,
    ///     username, issued refresh/access tokens, and whether a confirmation email was sent.
    /// </remarks>
    /// <param name="command">The registration details, including username, name, email, date of birth, and password.</param>
    /// <returns>A <c>201 Created</c> result wrapping a <see cref="ResponseBody{T}" /> of <see cref="RegistrationPayload" />.</returns>
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

    /// <summary>
    ///     Authenticates a user with a username and password.
    /// </summary>
    /// <remarks>
    ///     Allows anonymous access. On success, responds with <c>200 OK</c> containing the user's ID,
    ///     username, and a newly issued refresh/access token pair.
    /// </remarks>
    /// <param name="query">The login credentials (username and password).</param>
    /// <returns>An <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}" /> of <see cref="LoginPayload" />.</returns>
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

    /// <summary>
    ///     Confirms a user account using a confirmation token.
    /// </summary>
    /// <remarks>
    ///     Requires JWT authentication. On success, responds with <c>200 OK</c> containing the confirmed
    ///     user's ID and the confirmation timestamp.
    /// </remarks>
    /// <param name="token">The confirmation token supplied via the confirmation email link.</param>
    /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}" /> of <see cref="ConfirmationPayload" />.</returns>
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

    /// <summary>
    ///     Resends the account confirmation email for the specified user.
    /// </summary>
    /// <remarks>
    ///     Requires JWT authentication. On success, responds with <c>200 OK</c>.
    /// </remarks>
    /// <param name="userId">The unique identifier of the user account to resend the confirmation email for.</param>
    /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody" /> confirming the email was resent.</returns>
    [HttpPost("confirm/resend")]
    public async Task<ActionResult<ResponseBody>> ResendConfirmation([FromQuery] Guid userId)
    {
        await mediator.Send(new ResendConfirmationEmailCommand(userId));
        return Ok(new ResponseBody { Message = "confirmation email has been resent" });
    }

    /// <summary>
    ///     Exchanges a valid refresh token for a new access/refresh token pair.
    /// </summary>
    /// <remarks>
    ///     Allows anonymous access. On success, responds with <c>200 OK</c> containing the user's ID,
    ///     username, and the newly issued refresh/access token pair.
    /// </remarks>
    /// <param name="command">The request containing the refresh token to exchange.</param>
    /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}" /> of <see cref="LoginPayload" />.</returns>
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
