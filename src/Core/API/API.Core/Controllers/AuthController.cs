using DataAccessLayer.Entities;
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

        public record LoginRequest(string UsernameOrEmail, string Password);

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
            var userAccount = await auth.LoginAsync(req.UsernameOrEmail, req.Password);
            if (userAccount is null)
            {
                return Unauthorized();
            }

            var jwt = jwtService.GenerateJwt(userAccount.UserAccountId, userAccount.Username, userAccount.DateOfBirth);

            return Ok(new { AccessToken = jwt, Message = "Logged in successfully." });
        }
    }
}