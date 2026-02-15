using API.Core.Contracts.Auth;
using API.Core.Contracts.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.Auth;

namespace API.Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IRegisterService register, ILoginService login)
        : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserAccount>> Register(
            [FromBody] RegisterRequest req
        )
        {
            AuthServiceReturn rtn = await register.RegisterAsync(
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

            var response = new ResponseBody<AuthPayload>
            {
                Message = "User registered successfully.",
                Payload = new AuthPayload(
                    rtn.UserAccount.UserAccountId,
                    rtn.UserAccount.Username,
                    rtn.RefreshToken,
                    rtn.AccessToken
                ),
            };
            return Created("/", response);
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest req)
        {
            var rtn = await login.LoginAsync(req.Username, req.Password);

            return Ok(
                new ResponseBody<AuthPayload>
                {
                    Message = "Logged in successfully.",
                    Payload = new AuthPayload(
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
