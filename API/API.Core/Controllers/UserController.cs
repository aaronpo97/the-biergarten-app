using BusinessLayer.Services;
using DataAccessLayer.Entities;
using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
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
            if (user is null) return NotFound();
            return Ok(user);
        }
    }
}
