using API.Core.Contracts.Auth;
using API.Core.Contracts.Common;
using Domain.Entities;
using Infrastructure.Jwt;
using Microsoft.AspNetCore.Mvc;
using Service.Auth.Auth;

namespace API.Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IRegisterService register, ILoginService login, ITokenInfrastructure tokenInfrastructure) : ControllerBase
    {
        [HttpPost("register")]
        public async Task<ActionResult<UserAccount>> Register([FromBody] RegisterRequest req)
        {
            var created = await register.RegisterAsync(new UserAccount
            {
                UserAccountId = Guid.Empty,
                Username = req.Username,
                FirstName = req.FirstName,
                LastName = req.LastName,
                Email = req.Email,
                DateOfBirth = req.DateOfBirth
            }, req.Password);

            var jwtExpiresAt = DateTime.UtcNow.AddHours(1);
            var jwt = tokenInfrastructure.GenerateJwt(created.UserAccountId, created.Username, jwtExpiresAt
            );

            var response = new ResponseBody<AuthPayload>
            {
                Message = "User registered successfully.",
                Payload = new AuthPayload(
                    new UserDTO(created.UserAccountId, created.Username),
                    jwt,
                    DateTime.UtcNow,
                    jwtExpiresAt)
            };
            return Created("/", response);
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest req)
        {
            var userAccount = await login.LoginAsync(req.Username, req.Password);

            UserDTO dto = new(userAccount.UserAccountId, userAccount.Username);

            var jwtExpiresAt = DateTime.UtcNow.AddHours(1);
            var jwt = tokenInfrastructure.GenerateJwt(userAccount.UserAccountId, userAccount.Username, jwtExpiresAt);

            return Ok(new ResponseBody<AuthPayload>
            {
                Message = "Logged in successfully.",
                Payload = new AuthPayload(dto, jwt, DateTime.UtcNow, jwtExpiresAt)
            });
        }
    }
}
