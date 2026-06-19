using API.Core.Contracts.Breweries;
using API.Core.Contracts.Common;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Breweries;

namespace API.Core.Controllers;

/// <summary>
/// Provides CRUD endpoints for managing brewery posts.
/// </summary>
/// <remarks>
/// The controller is decorated with <c>[Authorize(AuthenticationSchemes = "JWT")]</c> by default; read endpoints
/// (<see cref="GetById"/> and <see cref="GetAll"/>) opt out via <c>[AllowAnonymous]</c>.
/// </remarks>
/// <param name="breweryService">Service used to query and mutate brewery post data.</param>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class BreweryController(IBreweryService breweryService) : ControllerBase
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
        var brewery = await breweryService.GetByIdAsync(id);
        if (brewery is null)
            return NotFound(new ResponseBody { Message = $"Brewery with ID {id} not found." });

        return Ok(new ResponseBody<BreweryDto>
        {
            Message = "Brewery retrieved successfully.",
            Payload = MapToDto(brewery),
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
        var breweries = await breweryService.GetAllAsync(limit, offset);
        return Ok(new ResponseBody<IEnumerable<BreweryDto>>
        {
            Message = "Breweries retrieved successfully.",
            Payload = breweries.Select(MapToDto),
        });
    }

    /// <summary>
    /// Creates a new brewery post.
    /// </summary>
    /// <param name="dto">The brewery details to create, including the posting user, name, description, and location.</param>
    /// <returns>
    /// A <c>201 Created</c> result wrapping a <see cref="ResponseBody{T}"/> of the newly created <see cref="BreweryDto"/>
    /// if creation succeeds; otherwise a <c>400 Bad Request</c> result wrapping a <see cref="ResponseBody"/> error message.
    /// </returns>
    [HttpPost]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Create([FromBody] BreweryCreateDto dto)
    {
        var request = new BreweryCreateRequest(
            dto.PostedById,
            dto.BreweryName,
            dto.Description,
            new BreweryLocationCreateRequest(
                dto.Location.CityId,
                dto.Location.AddressLine1,
                dto.Location.AddressLine2,
                dto.Location.PostalCode,
                dto.Location.Coordinates
            )
        );

        var result = await breweryService.CreateAsync(request);
        if (!result.Success)
            return BadRequest(new ResponseBody { Message = result.Message });

        return Created($"/api/brewery/{result.Brewery.BreweryPostId}", new ResponseBody<BreweryDto>
        {
            Message = "Brewery created successfully.",
            Payload = MapToDto(result.Brewery),
        });
    }

    /// <summary>
    /// Updates an existing brewery post.
    /// </summary>
    /// <param name="id">The unique identifier of the brewery post from the route, which must match <paramref name="dto"/>'s ID.</param>
    /// <param name="dto">The updated brewery details, including the posting user, name, description, and optional location.</param>
    /// <returns>
    /// A <c>200 OK</c> result wrapping a <see cref="ResponseBody{T}"/> of the updated brewery (as a <see cref="BreweryPost"/>)
    /// if the update succeeds; otherwise a <c>400 Bad Request</c> result wrapping a <see cref="ResponseBody"/> error message
    /// (returned when the route ID does not match the payload ID, or when the update itself fails).
    /// </returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ResponseBody<BreweryDto>>> Update(Guid id, [FromBody] BreweryDto dto)
    {
        if (dto.BreweryPostId != id)
            return BadRequest(new ResponseBody { Message = "Route ID does not match payload ID." });

        var request = new BreweryUpdateRequest(
            dto.BreweryPostId,
            dto.PostedById,
            dto.BreweryName,
            dto.Description,
            dto.Location is null ? null : new BreweryLocationUpdateRequest(
                dto.Location.BreweryPostLocationId,
                dto.Location.CityId,
                dto.Location.AddressLine1,
                dto.Location.AddressLine2,
                dto.Location.PostalCode,
                dto.Location.Coordinates
            )
        );

        var result = await breweryService.UpdateAsync(request);
        if (!result.Success)
            return BadRequest(new ResponseBody { Message = result.Message });

        return Ok(new ResponseBody<BreweryPost>
        {
            Message = "Brewery updated successfully.",
            Payload = result.Brewery,
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
        await breweryService.DeleteAsync(id);
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }

    /// <summary>
    /// Maps a <see cref="BreweryPost"/> domain entity to its <see cref="BreweryDto"/> representation,
    /// including its location, if present.
    /// </summary>
    /// <param name="b">The brewery post entity to map.</param>
    /// <returns>The mapped <see cref="BreweryDto"/>.</returns>
    private static BreweryDto MapToDto(BreweryPost b) => new()
    {
        BreweryPostId = b.BreweryPostId,
        PostedById = b.PostedById,
        BreweryName = b.BreweryName,
        Description = b.Description,
        CreatedAt = b.CreatedAt,
        UpdatedAt = b.UpdatedAt,
        Timer = b.Timer,
        Location = b.Location is null ? null : new BreweryLocationDto
        {
            BreweryPostLocationId = b.Location.BreweryPostLocationId,
            BreweryPostId = b.Location.BreweryPostId,
            CityId = b.Location.CityId,
            AddressLine1 = b.Location.AddressLine1,
            AddressLine2 = b.Location.AddressLine2,
            PostalCode = b.Location.PostalCode,
            Coordinates = b.Location.Coordinates,
        },
    };
}
