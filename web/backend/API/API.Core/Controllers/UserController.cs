using Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Service.UserManagement.User;

namespace API.Core.Controllers
{
    /// <summary>
    /// Provides read-only endpoints for retrieving user accounts.
    /// </summary>
    /// <param name="userService">Service used to query user account data.</param>
    [ApiController]
    [Route("api/[controller]")]
    public class UserController(IUserService userService) : ControllerBase
    {
        /// <summary>
        /// Retrieves a paginated list of user accounts.
        /// </summary>
        /// <param name="limit">The maximum number of user accounts to return, or <c>null</c> for no limit.</param>
        /// <param name="offset">The number of user accounts to skip before returning results, or <c>null</c> for no offset.</param>
        /// <returns>A <c>200 OK</c> result containing the collection of <see cref="UserAccount"/> entities.</returns>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<UserAccount>>> GetAll(
            [FromQuery] int? limit,
            [FromQuery] int? offset
        )
        {
            var users = await userService.GetAllAsync(limit, offset);
            return Ok(users);
        }

        /// <summary>
        /// Retrieves a single user account by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier of the user account to retrieve.</param>
        /// <returns>A <c>200 OK</c> result containing the matching <see cref="UserAccount"/>.</returns>
        [HttpGet("{id:guid}")]
        public async Task<ActionResult<UserAccount>> GetById(Guid id)
        {
            var user = await userService.GetByIdAsync(id);
            return Ok(user);
        }
    }
}
