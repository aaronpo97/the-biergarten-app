using System.Net;
using Repository.Core.Entities;
using Microsoft.AspNetCore.Mvc;
using ServiceCore.Services;

namespace WebAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController(IAuthService auth, IJwtService jwtService) : ControllerBase
    {
        public record RegisterRequest(
            string Username,
            string FirstName,
            string LastName,
            string Email,
            DateTime DateOfBirth,
            string Password
        );

        public record LoginRequest
        {
            public string Username { get; init; } = default!;
            public string Password { get; init; } = default!;
        }

        private record ResponseBody(string Message, object? Payload);

        [HttpPost("register")]
        public async Task<ActionResult<UserAccount>> Register([FromBody] RegisterRequest req)
        {
            var user = new UserAccount
            {
                UserAccountId = Guid.Empty,
                Username = req.Username,
                FirstName = req.FirstName,
                LastName = req.LastName,
                Email = req.Email,
                DateOfBirth = req.DateOfBirth
            };

            var created = await auth.RegisterAsync(user, req.Password);
            return CreatedAtAction(nameof(Register), new { id = created.UserAccountId }, created);
        }

        [HttpPost("login")]
        public async Task<ActionResult> Login([FromBody] LoginRequest req)
        {
            var userAccount = await auth.LoginAsync(req.Username, req.Password);
            if (userAccount is null)
            {
                return Unauthorized(new ResponseBody("Invalid username or password.", null));
            }

            var jwt = jwtService.GenerateJwt(userAccount.UserAccountId, userAccount.Username, userAccount.DateOfBirth);

            return Ok(new ResponseBody("Logged in successfully.", new { AccessToken = jwt }));
        }
    }
}
