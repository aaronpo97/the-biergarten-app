using System.IdentityModel.Tokens.Jwt;
using Domain.Exceptions;
using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.Commands.DeleteBrewery;
using Features.Breweries.Commands.UpdateBrewery;
using Features.Breweries.Dtos;
using Features.Breweries.Queries.GetAllBreweries;
using Features.Breweries.Queries.GetAllBreweryLocations;
using Features.Breweries.Queries.GetBreweryById;
using Features.Breweries.Queries.GetBreweryLocationsWithinRange;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Features.Breweries.Controllers;

/// <summary>Exposes CRUD operations for brewery posts.</summary>
/// <remarks>
///     Requires JWT authentication by default; <see cref="GetById" /> and <see cref="GetAll" /> opt out via
///     <c>[AllowAnonymous]</c>.
/// </remarks>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class BreweryController(IMediator mediator) : ControllerBase
{
    private Guid GetAuthenticatedUserId()
    {
        string? userIdClaim = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value;
        if (!Guid.TryParse(userIdClaim, out Guid userId))
            throw new UnauthorizedException("Access token is missing a valid user ID claim");
        return userId;
    }

    /// <summary>Retrieves a single brewery post by ID.</summary>
    /// <remarks>Allows anonymous access.</remarks>
    /// <returns><c>200 OK</c> with the brewery if found; otherwise <c>404 Not Found</c>.</returns>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> GetById(Guid id)
    {
        BreweryDto? brewery = await mediator.Send(new GetBreweryByIdQuery(id));
        if (brewery is null)
            return NotFound(new ResponseBody { Message = $"Brewery with ID {id} not found." });

        return Ok(
            new ResponseBody<BreweryDto>
            {
                Message = "Brewery retrieved successfully.",
                Payload = brewery,
            }
        );
    }

    /// <summary>Retrieves brewery posts, newest first.</summary>
    /// <param name="limit">Maximum number of breweries to return. Unbounded if <see langword="null"/>.</param>
    /// <param name="offset">Number of breweries to skip. Treated as zero if <see langword="null"/>.</param>
    /// <remarks>Allows anonymous access.</remarks>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ResponseBody<IEnumerable<BreweryDto>>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset
    )
    {
        IEnumerable<BreweryDto> breweries = await mediator.Send(
            new GetAllBreweriesQuery(limit, offset)
        );
        return Ok(
            new ResponseBody<IEnumerable<BreweryDto>>
            {
                Message = "Breweries retrieved successfully.",
                Payload = breweries,
            }
        );
    }

    /// <summary>Retrieves all brewery posts that have a set location.</summary>
    /// <remarks>Allows anonymous access.</remarks>
    [AllowAnonymous]
    [HttpGet("locations")]
    public async Task<ActionResult<ResponseBody<IEnumerable<BreweryWithLocationDto>>>> GetAllLocations()
    {
        IEnumerable<BreweryWithLocationDto> breweries = await mediator.Send(
            new GetAllBreweryLocationsQuery()
        );
        return Ok(
            new ResponseBody<IEnumerable<BreweryWithLocationDto>>
            {
                Message = "Brewery locations retrieved successfully.",
                Payload = breweries,
            }
        );
    }

    /// <summary>Retrieves brewery posts with a set location within range of the given coordinates, nearest first.</summary>
    /// <param name="latitude">The origin latitude, in decimal degrees.</param>
    /// <param name="longitude">The origin longitude, in decimal degrees.</param>
    /// <param name="rangeInMetres">The maximum distance, in metres, from the origin coordinates.</param>
    /// <remarks>Allows anonymous access.</remarks>
    [AllowAnonymous]
    [HttpGet("locations/nearby")]
    public async Task<ActionResult<ResponseBody<IEnumerable<BreweryWithLocationDto>>>> GetLocationsWithinRange(
        [FromQuery] double latitude,
        [FromQuery] double longitude,
        [FromQuery] double rangeInMetres
    )
    {
        IEnumerable<BreweryWithLocationDto> breweries = await mediator.Send(
            new GetBreweryLocationsWithinRangeQuery(latitude, longitude, rangeInMetres)
        );
        return Ok(
            new ResponseBody<IEnumerable<BreweryWithLocationDto>>
            {
                Message = "Brewery locations retrieved successfully.",
                Payload = breweries,
            }
        );
    }

    /// <summary>Creates a new brewery post.</summary>
    /// <returns><c>201 Created</c> with the newly created brewery.</returns>
    [HttpPost]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Create(
        [FromBody] CreateBreweryRequest request
    )
    {
        BreweryDto brewery = await mediator.Send(
            new CreateBreweryCommand(
                GetAuthenticatedUserId(),
                request.BreweryName,
                request.Description,
                request.Location
            )
        );
        return Created(
            $"/api/brewery/{brewery.BreweryPostId}",
            new ResponseBody<BreweryDto>
            {
                Message = "Brewery created successfully.",
                Payload = brewery,
            }
        );
    }

    /// <summary>Updates an existing brewery post.</summary>
    /// <returns>
    ///     <c>200 OK</c> with the updated brewery; <c>404 Not Found</c> if the brewery or its <c>CityId</c>
    ///     does not exist; or <c>409 Conflict</c> if the brewery was modified since <c>request.RowVersion</c>
    ///     was read.
    /// </returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Update(
        [FromBody] UpdateBreweryRequest request
    )
    {

        BreweryDto breweryUpdated = await mediator.Send(
            new UpdateBreweryCommand(
                request.BreweryPostId,
                GetAuthenticatedUserId(),
                request.RowVersion,
                request.BreweryName,
                request.Description,
                request.Location
            )
        );

        return Ok(
            new ResponseBody<BreweryDto>
            {
                Message = "Brewery updated successfully.",
                Payload = breweryUpdated,
            }
        );
    }

    /// <summary>Deletes a brewery post.</summary>
    /// <returns><c>200 OK</c> confirming the deletion; <c>404 Not Found</c> if no brewery exists with <paramref name="id" />.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ResponseBody>> Delete(Guid id)
    {
        await mediator.Send(new DeleteBreweryCommand(id, GetAuthenticatedUserId()));
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }
}