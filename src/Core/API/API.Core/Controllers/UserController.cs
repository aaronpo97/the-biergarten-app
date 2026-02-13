using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.UserManagement.User;

namespace API.Core.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(IUserService userService) : ControllerBase
    {
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserAccount>>> GetAll([FromQuery] int? limit, [FromQuery] int? offset)
        {
            var users = await userService.GetAllAsync(limit, offset);
            return Ok(users);
        }

        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserAccount>> GetById(Guid id)
        {
            var user = await userService.GetByIdAsync(id);
            return Ok(user);
        }
    }
}
