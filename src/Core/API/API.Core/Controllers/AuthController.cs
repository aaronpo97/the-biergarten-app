using API.Core.Contracts.Auth;
using API.Core.Contracts.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Auth;

namespace API.Core.Controllers
{
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

        [HttpPost("confirm/resend")]
        public async Task<ActionResult> ResendConfirmation([FromQuery] Guid userId)
        {
            await confirmationService.ResendConfirmationEmailAsync(userId);
            return Ok(new ResponseBody { Message = "confirmation email has been resent" });
        }

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
