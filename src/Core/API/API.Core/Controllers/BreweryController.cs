using API.Core.Contracts.Breweries;
using API.Core.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Breweries;

namespace API.Core.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class BreweryController(IBreweryService breweryService) : ControllerBase
{
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

        return Ok(new ResponseBody<BreweryDto>
        {
            Message = "Brewery updated successfully.",
            Payload = MapToDto(result.Brewery),
        });
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ResponseBody>> Delete(Guid id)
    {
        await breweryService.DeleteAsync(id);
        return Ok(new ResponseBody { Message = "Brewery deleted successfully." });
    }

    private static BreweryDto MapToDto(Domain.Entities.BreweryPost b) => new()
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
