using Domain.Entities;
using Features.UserManagement.Queries.GetAllUsers;
using Features.UserManagement.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Features.UserManagement.Controllers;

/// <summary>
///     Provides read-only endpoints for retrieving user accounts.
/// </summary>
/// <param name="mediator">Used to dispatch user queries to their handlers.</param>
[ApiController]
[Route("api/[controller]")]
public class UserController(IMediator mediator) : ControllerBase
{
    /// <summary>
    ///     Retrieves a paginated list of user accounts.
    /// </summary>
    /// <param name="limit">The maximum number of user accounts to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of user accounts to skip before returning results, or <c>null</c> for no offset.</param>
    /// <returns>A <c>200 OK</c> result containing the collection of <see cref="UserAccount" /> entities.</returns>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserAccount>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset
    )
    {
        IEnumerable<UserAccount> users = await mediator.Send(new GetAllUsersQuery(limit, offset));
        return Ok(users);
    }

    /// <summary>
    ///     Retrieves a single user account by its unique identifier.
    /// </summary>
    /// <param name="id">The unique identifier of the user account to retrieve.</param>
    /// <returns>A <c>200 OK</c> result containing the matching <see cref="UserAccount" />.</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserAccount>> GetById(Guid id)
    {
        UserAccount user = await mediator.Send(new GetUserByIdQuery(id));
        return Ok(user);
    }
}