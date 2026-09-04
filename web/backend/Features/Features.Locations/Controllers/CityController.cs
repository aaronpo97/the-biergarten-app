using Features.Locations.Dtos;
using Features.Locations.Queries.GetAllCities;
using Features.Locations.Queries.GetCityById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace Features.Locations.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class CityController(IMediator mediator) : ControllerBase
{
    [AllowAnonymous]
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ResponseBody<CityDto>>> GetById(Guid id)
    {
        CityDto? city = await mediator.Send(new GetCityByIdQuery(id));
        if (city is null)
            return NotFound(new ResponseBody { Message = $"City with ID {id} not found." });

        return Ok(
            new ResponseBody<CityDto> { Message = "City retrieved successfully.", Payload = city }
        );
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<ActionResult<ResponseBody<IEnumerable<CityDto>>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] int? offset
    )
    {
        IEnumerable<CityDto> cities = await mediator.Send(new GetAllCitiesQuery(limit, offset));
        return Ok(
            new ResponseBody<IEnumerable<CityDto>>
            {
                Message = "Cities retrieved successfully.",
                Payload = cities,
            }
        );
    }
}
