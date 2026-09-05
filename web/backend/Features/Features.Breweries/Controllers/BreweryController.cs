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

/// <summary>
///     Provides HTTP endpoints for reading and managing brewery posts.
/// </summary>
/// <remarks>
///     Requests require JWT authentication unless the endpoint allows anonymous access.
/// </remarks>
///
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class BreweryController(IMediator mediator) : ControllerBase
{
    /// <summary>
    ///     Returns the brewery post identified by <paramref name="id" />.
    /// </summary>
    /// <remarks>This endpoint permits anonymous access.</remarks>
    /// <returns>
    ///     A successful response containing the post, or <c>404 Not Found</c> when it is absent.
    /// </returns>
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

    /// <summary>
    ///     Returns brewery posts in reverse chronological order.
    /// </summary>
    /// <param name="limit">
    ///     Limits the number of returned posts; <see langword="null" /> leaves it unlimited.
    /// </param>
    /// <param name="offset">
    ///     Skips this many posts; <see langword="null" /> means none.
    /// </param>
    /// <remarks>This endpoint permits anonymous access.</remarks>
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

    /// <summary>
    ///     Returns all brewery posts with an associated location.
    /// </summary>
    /// <remarks>This endpoint permits anonymous access.</remarks>
    [AllowAnonymous]
    [HttpGet("locations")]
    public async Task<
        ActionResult<ResponseBody<IEnumerable<BreweryWithLocationDto>>>
    > GetAllLocations()
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

    /// <summary>
    ///     Returns located brewery posts within the requested radius, ordered by proximity.
    /// </summary>
    /// <param name="latitude">
    ///     Identifies the origin latitude in decimal degrees.
    /// </param>
    /// <param name="longitude">
    ///     Identifies the origin longitude in decimal degrees.
    /// </param>
    /// <param name="rangeInMetres">
    ///     Sets the maximum distance from the origin in metres.
    /// </param>
    /// <remarks>This endpoint permits anonymous access.</remarks>
    [AllowAnonymous]
    [HttpGet("locations/nearby")]
    public async Task<
        ActionResult<ResponseBody<IEnumerable<BreweryWithLocationDto>>>
    > GetLocationsWithinRange(
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

    /// <summary>
    ///     Creates a brewery post for the authenticated user.
    /// </summary>
    /// <returns>A <c>201 Created</c> response containing the new post.</returns>
    [HttpPost]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Create(
        [FromBody] CreateBreweryRequest request
    )
    {
        BreweryDto brewery = await mediator.Send(
            new CreateBreweryCommand(
                User.GetAuthenticatedUserId(),
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

    /// <summary>
    ///     Updates a brewery post owned by the authenticated user.
    /// </summary>
    /// <param name="id">
    ///     Must equal the brewery post identifier in <paramref name="request" />.
    /// </param>
    /// <returns>
    ///     A successful response containing the updated post, or an error for an invalid ID,
    ///     missing resource, or stale row version.
    /// </returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Update(
        Guid id,
        [FromBody] UpdateBreweryRequest request
    )
    {
        if (request.BreweryPostId != id)
            return BadRequest(new ResponseBody { Message = "Route ID does not match payload ID." });

        BreweryDto breweryUpdated = await mediator.Send(
            new UpdateBreweryCommand(
                request.BreweryPostId,
                User.GetAuthenticatedUserId(),
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

    /// <summary>
    ///     Deletes a brewery post owned by the authenticated user.
    /// </summary>
    /// <returns>
    ///     A confirmation response, or <c>404 Not Found</c> if the post is absent.
    /// </returns>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ResponseBody>> Delete(Guid id)
    {
        await mediator.Send(new DeleteBreweryCommand(id, User.GetAuthenticatedUserId()));
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }
}
