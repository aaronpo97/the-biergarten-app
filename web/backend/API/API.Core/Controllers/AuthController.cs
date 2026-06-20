using API.Core.Contracts.Auth;
using Shared.Contracts;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Auth;

namespace API.Core.Controllers
{
    /// <summary>
    /// Handles user authentication concerns: registration, login, email confirmation, and token refresh.
    /// </summary>
    /// <remarks>
    /// The controller is decorated with <c>[Authorize(AuthenticationSchemes = "JWT")]</c> by default, but most
    /// actions opt out via <c>[AllowAnonymous]</c> since they are entry points used before a caller holds a token.
    /// </remarks>
    /// <param name="registerService">Service used to register new user accounts.</param>
    /// <param name="loginService">Service used to authenticate existing user accounts.</param>
    /// <param name="confirmationService">Service used to confirm user accounts and resend confirmation emails.</param>
    /// <param name="tokenService">Service used to refresh JWT access/refresh token pairs.</param>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(AuthenticationSchemes = "JWT")]
    public class AuthController(
        IRegisterService registerService,
        ILoginService loginService,
        IConfirmationService confirmationService,
        ITokenService tokenService
    ) : ControllerBase
    {
        /// <summary>
        /// Registers a new user account.
        /// </summary>
        /// <remarks>
        /// Allows anonymous access. On success, responds with <c>201 Created</c> containing the new user's ID,
        /// username, issued refresh/access tokens, and whether a confirmation email was sent.
        /// </remarks>
        /// <param name="req">The registration details, including username, name, email, date of birth, and password.</param>
        /// <returns>A <c>201 Created</c> result wrapping a <see cref="ResponseBody{T}"/> of <see cref="RegistrationPayload"/>.</returns>
        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<UserAccount>> Register(
            [FromBody] RegisterRequest req
        )
        {
            var rtn = await registerService.RegisterAsync(
                new UserAccount
                {
                    UserAccountId = Guid.Empty,
                    Username = req.Username,
                    FirstName = req.FirstName,
                    LastName = req.LastName,
                    Email = req.Email,
                    DateOfBirth = req.DateOfBirth,
                },
                req.Password
            );

            var response = new ResponseBody<RegistrationPayload>
            {
                Message = "User registered successfully.",
                Payload = new RegistrationPayload(
                    rtn.UserAccount.UserAccountId,
                    rtn.UserAccount.Username,
                    rtn.RefreshToken,
                    rtn.AccessToken,
                    rtn.EmailSent
                ),
            };
            return Created("/", response);
        }

        /// <summary>
        /// Authenticates a user with a username and password.
        /// </summary>
        /// <remarks>
        /// Allows anonymous access. On success, responds with <c>200 OK</c> containing the user's ID,
        /// username, and a newly issued refresh/access token pair.
        /// </remarks>
        /// <param name="req">The login credentials (username and password).</param>
        /// <returns>An <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of <see cref="LoginPayload"/>.</returns>
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest req)
        {
            var rtn = await loginService.LoginAsync(req.Username, req.Password);

            return Ok(
                new ResponseBody<LoginPayload>
                {
                    Message = "Logged in successfully.",
                    Payload = new LoginPayload(
                        rtn.UserAccount.UserAccountId,
                        rtn.UserAccount.Username,
                        rtn.RefreshToken,
                        rtn.AccessToken
                    ),
                }
            );
        }

        /// <summary>
        /// Confirms a user account using a confirmation token.
        /// </summary>
        /// <remarks>
        /// Requires JWT authentication. On success, responds with <c>200 OK</c> containing the confirmed
        /// user's ID and the confirmation timestamp.
        /// </remarks>
        /// <param name="token">The confirmation token supplied via the confirmation email link.</param>
        /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of <see cref="ConfirmationPayload"/>.</returns>
        [HttpPost("confirm")]
        public async Task<ActionResult> Confirm([FromQuery] string token)
        {
            var rtn = await confirmationService.ConfirmUserAsync(token);
            return Ok(
                new ResponseBody<ConfirmationPayload>
                {
                    Message = "User with ID " + rtn.UserId + " is confirmed.",
                    Payload = new ConfirmationPayload(
                        rtn.UserId,
                        rtn.ConfirmedAt
                    ),
                }
            );
        }

        /// <summary>
        /// Resends the account confirmation email for the specified user.
        /// </summary>
        /// <remarks>
        /// Requires JWT authentication. On success, responds with <c>200 OK</c>.
        /// </remarks>
        /// <param name="userId">The unique identifier of the user account to resend the confirmation email for.</param>
        /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody"/> confirming the email was resent.</returns>
        [HttpPost("confirm/resend")]
        public async Task<ActionResult> ResendConfirmation([FromQuery] Guid userId)
        {
            await confirmationService.ResendConfirmationEmailAsync(userId);
            return Ok(new ResponseBody { Message = "confirmation email has been resent" });
        }

        /// <summary>
        /// Exchanges a valid refresh token for a new access/refresh token pair.
        /// </summary>
        /// <remarks>
        /// Allows anonymous access. On success, responds with <c>200 OK</c> containing the user's ID,
        /// username, and the newly issued refresh/access token pair.
        /// </remarks>
        /// <param name="req">The request containing the refresh token to exchange.</param>
        /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of <see cref="LoginPayload"/>.</returns>
        [AllowAnonymous]
        [HttpPost("refresh")]
        public async Task<ActionResult> Refresh(
            [FromBody] RefreshTokenRequest req
        )
        {
            var rtn = await tokenService.RefreshTokenAsync(req.RefreshToken);

            return Ok(
                new ResponseBody<LoginPayload>
                {
                    Message = "Token refreshed successfully.",
                    Payload = new LoginPayload(
                        rtn.UserAccount.UserAccountId,
                        rtn.UserAccount.Username,
                        rtn.RefreshToken,
                        rtn.AccessToken
                    ),
                }
            );
        }
    }
}
