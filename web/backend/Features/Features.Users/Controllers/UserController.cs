using Domain.Entities;
using Domain.Exceptions;
using Features.Users.Dtos;
using Features.Users.Queries.GetAllUsers;
using Features.Users.Queries.GetPublicUserProfileById;
using Features.Users.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Features.Users.Controllers;

/// <summary>
///     Exposes read endpoints for user accounts.
/// </summary>
/// <remarks>
///     The controller is decorated with <c>[Authorize(AuthenticationSchemes = "JWT")]</c> by default, since
///     <see cref="GetAll" /> and <see cref="GetById" /> serialize the full <see cref="UserAccount" />, including
///     <c>Email</c> and <c>DateOfBirth</c>. Only <see cref="GetPublicProfile" /> opts out via
///     <c>[AllowAnonymous]</c>, since it is the sole endpoint that returns an allowlisted, public-safe DTO.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
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

    /// <summary>Gets the public profile for the user account with the given ID.</summary>
    /// <remarks>
    /// Anonymous access. Exposes only the fields that are safe to show on a public profile page;
    /// unlike <see cref="GetById"/>, this never returns <c>Email</c> or <c>DateOfBirth</c>.
    /// </remarks>
    /// <exception cref="NotFoundException">
    /// Thrown when no user account exists with the given ID, resulting in a 404 response.
    /// </exception>
    [AllowAnonymous]
    [HttpGet("{id:guid}/profile")]
    public async Task<ActionResult<PublicUserProfileDto>> GetPublicProfile(Guid id)
    {
        PublicUserProfileDto profile = await mediator.Send(new GetPublicUserProfileByIdQuery(id));
        return Ok(profile);
    }
}
