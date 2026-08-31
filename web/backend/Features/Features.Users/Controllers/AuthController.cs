using Features.Auth.Commands.Account.DeleteAccount;
using Features.Auth.Commands.Account.UpdateEmail;
using Features.Auth.Commands.Account.UpdatePassword;
using Features.Auth.Commands.Account.UpdateUsername;
using Features.Auth.Commands.Authentication.ConfirmUser;
using Features.Auth.Commands.Authentication.Login;
using Features.Auth.Commands.Authentication.RefreshToken;
using Features.Auth.Commands.Authentication.RegisterUser;
using Features.Auth.Commands.Authentication.ResendConfirmationEmail;
using Features.Auth.Commands.Profile.UpdateProfile;
using Features.Auth.Dtos;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Features.Auth.Controllers;

/// <summary>
///     Handles user authentication concerns: registration, login, email confirmation, token refresh, and
///     self-service account management.
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
    public async Task<ActionResult<ResponseBody<LoginPayload>>> Login(
        [FromBody] LoginCommand command
    )
    {
        LoginPayload payload = await mediator.Send(command);
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
    ///     Anonymous access. The refresh token is supplied via the <c>X-Refresh-Token</c> header, not the
    ///     request body. Returns 200 OK with the new tokens, 400 Bad Request if the header is missing, or
    ///     401 Unauthorized if the refresh token is invalid or expired.
    /// </remarks>
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<ResponseBody<LoginPayload>>> Refresh(
        [FromHeader(Name = "X-Refresh-Token")] string? refreshToken
    )
    {
        LoginPayload payload = await mediator.Send(
            new RefreshTokenCommand(refreshToken ?? string.Empty)
        );
        return Ok(
            new ResponseBody<LoginPayload>
            {
                Message = "Token refreshed successfully.",
                Payload = payload,
            }
        );
    }

    /// <summary>Changes the authenticated user's username.</summary>
    /// <remarks>Returns 200 OK with the updated username, or 409 Conflict if it is already taken.</remarks>
    [HttpPatch("username")]
    public async Task<ActionResult<ResponseBody<UpdateUsernamePayload>>> UpdateUsername(
        [FromBody] UpdateUsernameRequest request
    )
    {
        UpdateUsernamePayload payload = await mediator.Send(
            new UpdateUsernameCommand(User.GetAuthenticatedUserId(), request.NewUsername)
        );
        return Ok(
            new ResponseBody<UpdateUsernamePayload>
            {
                Message = "Username updated successfully.",
                Payload = payload,
            }
        );
    }

    /// <summary>Changes the authenticated user's email address.</summary>
    /// <remarks>
    ///     Returns 200 OK with the updated (now unconfirmed) email address, or 409 Conflict if it is
    ///     already in use. The caller should use <c>POST /api/auth/confirm/resend</c> to re-confirm.
    /// </remarks>
    [HttpPatch("email")]
    public async Task<ActionResult<ResponseBody<UpdateEmailPayload>>> UpdateEmail(
        [FromBody] UpdateEmailRequest request
    )
    {
        UpdateEmailPayload payload = await mediator.Send(
            new UpdateEmailCommand(User.GetAuthenticatedUserId(), request.NewEmail)
        );
        return Ok(
            new ResponseBody<UpdateEmailPayload>
            {
                Message = "Email updated successfully.",
                Payload = payload,
            }
        );
    }

    /// <summary>Changes the authenticated user's password.</summary>
    /// <remarks>
    ///     Returns 200 OK on success, or 401 Unauthorized if <c>CurrentPassword</c> does not match the
    ///     account's current password.
    /// </remarks>
    [HttpPatch("password")]
    public async Task<ActionResult<ResponseBody<UpdatePasswordPayload>>> UpdatePassword(
        [FromBody] UpdatePasswordRequest request
    )
    {
        UpdatePasswordPayload payload = await mediator.Send(
            new UpdatePasswordCommand(
                User.GetAuthenticatedUserId(),
                request.CurrentPassword,
                request.NewPassword
            )
        );
        return Ok(
            new ResponseBody<UpdatePasswordPayload>
            {
                Message = "Password updated successfully.",
                Payload = payload,
            }
        );
    }

    /// <summary>Updates the authenticated user's profile fields (first name, last name, date of birth).</summary>
    /// <remarks>Returns 200 OK with the updated profile.</remarks>
    [HttpPatch("profile")]
    public async Task<ActionResult<ResponseBody<UpdateProfilePayload>>> UpdateProfile(
        [FromBody] UpdateProfileRequest request
    )
    {
        UpdateProfilePayload payload = await mediator.Send(
            new UpdateProfileCommand(
                User.GetAuthenticatedUserId(),
                request.FirstName,
                request.LastName,
                request.DateOfBirth
            )
        );
        return Ok(
            new ResponseBody<UpdateProfilePayload>
            {
                Message = "Profile updated successfully.",
                Payload = payload,
            }
        );
    }

    /// <summary>Permanently deletes the authenticated user's account.</summary>
    /// <remarks>
    ///     Returns 200 OK on success, or 409 Conflict if the account still has associated posts, comments,
    ///     photos, or follows.
    /// </remarks>
    [HttpDelete("account")]
    public async Task<ActionResult<ResponseBody>> DeleteAccount()
    {
        await mediator.Send(new DeleteAccountCommand(User.GetAuthenticatedUserId()));
        return Ok(new ResponseBody { Message = "Account deleted successfully." });
    }
}
