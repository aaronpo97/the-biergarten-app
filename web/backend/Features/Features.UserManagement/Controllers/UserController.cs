using Domain.Entities;
using Domain.Exceptions;
using Features.UserManagement.Queries.GetAllUsers;
using Features.UserManagement.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Features.UserManagement.Controllers;

/// <summary>
///     Exposes read endpoints for user accounts.
/// </summary>
[ApiController]
[Route("api/[controller]")]
public class UserController(IMediator mediator) : ControllerBase
{
    /// <summary>Gets a page of user accounts, ordered by creation date descending.</summary>
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

    /// <summary>Gets the user account with the given ID.</summary>
    /// <exception cref="NotFoundException">
    /// Thrown when no user account exists with the given ID, resulting in a 404 response.
    /// </exception>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserAccount>> GetById(Guid id)
    {
        UserAccount user = await mediator.Send(new GetUserByIdQuery(id));
        return Ok(user);
    }
}
