using Domain.Entities;
using Domain.Exceptions;
using Features.Users.Dtos;
using Features.Users.Queries.GetAllUsers;
using Features.Users.Queries.GetPublicUserProfileById;
using Features.Users.Queries.GetUserById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Features.Users.Controllers;

/// <summary>
///     Exposes read endpoints for user accounts.
/// </summary>
/// <remarks>
///     Every endpoint requires <c>[Authorize(AuthenticationSchemes = "JWT")]</c> except
///     <see cref="GetPublicProfile" />, which is <see cref="AllowAnonymousAttribute" /> since it
///     only returns an allowlisted DTO. <see cref="GetById" /> also restricts access to the
///     caller's own account. Neither <see cref="GetAll" /> nor <see cref="GetById" /> may expose
///     another user's <c>Email</c> or <c>DateOfBirth</c>.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class UserController(IMediator mediator) : ControllerBase
{
    /// <summary>Gets a page of user accounts' public profiles, ordered by creation date descending.</summary>
    /// <param name="limit"><c>null</c> for no limit.</param>
    /// <param name="offset"><c>null</c> for no offset.</param>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<PublicUserProfileDto>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset
    )
    {
        IEnumerable<PublicUserProfileDto> users = await mediator.Send(
            new GetAllUsersQuery(limit, offset)
        );
        return Ok(users);
    }

    /// <summary>Gets the caller's own user account by ID.</summary>
    /// <exception cref="ForbiddenException">
    /// Thrown when <paramref name="id"/> is not the caller's own account. The API returns HTTP status 403.
    /// </exception>
    /// <exception cref="NotFoundException">
    /// Thrown when no user account exists with the given ID, resulting in a 404 response.
    /// </exception>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<UserAccount>> GetById(Guid id)
    {
        UserAccount user = await mediator.Send(
            new GetUserByIdQuery(id, User.GetAuthenticatedUserId())
        );
        return Ok(user);
    }

    /// <summary>Gets the public profile for the user account with the given ID.</summary>
    /// <remarks>
    /// This endpoint is anonymous-accessible and requires no ownership. Anyone can view any
    /// account's public profile. The response includes only fields that are safe to show publicly.
    /// Unlike <see cref="GetById"/>, it never includes <c>Email</c> or <c>DateOfBirth</c>.
    /// </remarks>
    /// <exception cref="NotFoundException">
    /// Thrown when no user account exists with the given ID. The API returns HTTP status 404.
    /// </exception>
    [HttpGet("{id:guid}/profile")]
    [AllowAnonymous]
    public async Task<ActionResult<PublicUserProfileDto>> GetPublicProfile(Guid id)
    {
        PublicUserProfileDto profile = await mediator.Send(new GetPublicUserProfileByIdQuery(id));
        return Ok(profile);
    }
}
