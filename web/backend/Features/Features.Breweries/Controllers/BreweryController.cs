using Features.Breweries.Commands.CreateBrewery;
using Features.Breweries.Commands.DeleteBrewery;
using Features.Breweries.Commands.UpdateBrewery;
using Features.Breweries.Dtos;
using Features.Breweries.Queries.GetAllBreweries;
using Features.Breweries.Queries.GetBreweryById;
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

    /// <summary>Creates a new brewery post.</summary>
    /// <returns><c>201 Created</c> with the newly created brewery.</returns>
    [HttpPost]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Create(
        [FromBody] CreateBreweryCommand command
    )
    {
        BreweryDto brewery = await mediator.Send(command);
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
    /// <param name="id">Must match <paramref name="command" />'s <c>BreweryPostId</c>.</param>
    /// <returns>
    ///     <c>200 OK</c> with the updated brewery; <c>400 Bad Request</c> if the route ID does not match the
    ///     payload ID; <c>404 Not Found</c> if the brewery or its <c>CityId</c> does not exist; or
    ///     <c>409 Conflict</c> if the brewery was modified since <c>command.Timer</c> was read.
    /// </returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Update(
        Guid id,
        [FromBody] UpdateBreweryCommand command
    )
    {
        if (command.BreweryPostId != id)
            return BadRequest(new ResponseBody { Message = "Route ID does not match payload ID." });

        BreweryDto brewery = await mediator.Send(command);
        return Ok(
            new ResponseBody<BreweryDto>
            {
                Message = "Brewery updated successfully.",
                Payload = brewery,
            }
        );
    }

    /// <summary>Deletes a brewery post.</summary>
    /// <returns><c>200 OK</c> confirming the deletion; <c>404 Not Found</c> if no brewery exists with <paramref name="id" />.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ResponseBody>> Delete(Guid id)
    {
        await mediator.Send(new DeleteBreweryCommand(id));
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }
}
