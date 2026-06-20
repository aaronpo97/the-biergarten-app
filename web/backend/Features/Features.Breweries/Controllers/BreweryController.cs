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

/// <summary>
/// Provides CRUD endpoints for managing brewery posts.
/// </summary>
/// <remarks>
/// The controller is decorated with <c>[Authorize(AuthenticationSchemes = "JWT")]</c> by default; read endpoints
/// (<see cref="GetById"/> and <see cref="GetAll"/>) opt out via <c>[AllowAnonymous]</c>.
/// </remarks>
/// <param name="mediator">Used to dispatch brewery commands and queries to their handlers.</param>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class BreweryController(IMediator mediator) : ControllerBase
{
    /// <summary>
    /// Retrieves a single brewery post by its unique identifier.
    /// </summary>
    /// <remarks>Allows anonymous access.</remarks>
    /// <param name="id">The unique identifier of the brewery post to retrieve.</param>
    /// <returns>
    /// A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of <see cref="BreweryDto"/> if found;
    /// otherwise a <c>404 Not Found</c> result wrapping a <see cref="ResponseBody"/> error message.
    /// </returns>
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> GetById(Guid id)
    {
        var brewery = await mediator.Send(new GetBreweryByIdQuery(id));
        if (brewery is null)
            return NotFound(new ResponseBody { Message = $"Brewery with ID {id} not found." });

        return Ok(new ResponseBody<BreweryDto>
        {
            Message = "Brewery retrieved successfully.",
            Payload = brewery,
        });
    }

    /// <summary>
    /// Retrieves a paginated list of brewery posts.
    /// </summary>
    /// <remarks>Allows anonymous access.</remarks>
    /// <param name="limit">The maximum number of brewery posts to return, or <c>null</c> for no limit.</param>
    /// <param name="offset">The number of brewery posts to skip before returning results, or <c>null</c> for no offset.</param>
    /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of a collection of <see cref="BreweryDto"/>.</returns>
    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ResponseBody<IEnumerable<BreweryDto>>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset)
    {
        var breweries = await mediator.Send(new GetAllBreweriesQuery(limit, offset));
        return Ok(new ResponseBody<IEnumerable<BreweryDto>>
        {
            Message = "Breweries retrieved successfully.",
            Payload = breweries,
        });
    }

    /// <summary>
    /// Creates a new brewery post.
    /// </summary>
    /// <param name="command">The brewery details to create, including the posting user, name, description, and location.</param>
    /// <returns>A <c>201 Created</c> result wrapping a <see cref="ResponseBody{T}"/> of the newly created <see cref="BreweryDto"/>.</returns>
    [HttpPost]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Create([FromBody] CreateBreweryCommand command)
    {
        var brewery = await mediator.Send(command);
        return Created($"/api/brewery/{brewery.BreweryPostId}", new ResponseBody<BreweryDto>
        {
            Message = "Brewery created successfully.",
            Payload = brewery,
        });
    }

    /// <summary>
    /// Updates an existing brewery post.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post from the route, which must match <paramref name="command"/>'s ID.</param>
    /// <param name="command">The updated brewery details, including the posting user, name, description, and optional location.</param>
    /// <returns>
    /// A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of the updated <see cref="BreweryDto"/> if the
    /// update succeeds; otherwise a <c>400 Bad Request</c> result wrapping a <see cref="ResponseBody"/> error message
    /// when the route ID does not match the payload ID.
    /// </returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Update(Guid id, [FromBody] UpdateBreweryCommand command)
    {
        if (command.BreweryPostId != id)
            return BadRequest(new ResponseBody { Message = "Route ID does not match payload ID." });

        var brewery = await mediator.Send(command);
        return Ok(new ResponseBody<BreweryDto>
        {
            Message = "Brewery updated successfully.",
            Payload = brewery,
        });
    }

    /// <summary>
    /// Deletes a brewery post.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post to delete.</param>
    /// <returns>A <c>200 OK</c> result wrapping a <see cref="ResponseBody"/> confirming the deletion.</returns>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ResponseBody>> Delete(Guid id)
    {
        await mediator.Send(new DeleteBreweryCommand(id));
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }
}
