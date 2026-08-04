using Domain.Entities;
using Features.UserManagement.Queries.GetAllUsers;
using Features.UserManagement.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Features.UserManagement.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IMediator mediator) : ControllerBase
{
    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserAccount>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset
    )
    {
        IEnumerable<UserAccount> users = await mediator.Send(new GetAllUsersQuery(limit, offset));
        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserAccount>> GetById(Guid id)
    {
        UserAccount user = await mediator.Send(new GetUserByIdQuery(id));
        return Ok(user);
    }
}
