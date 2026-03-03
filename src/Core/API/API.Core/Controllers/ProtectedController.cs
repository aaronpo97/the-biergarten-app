using System.Security.Claims;
using API.Core.Contracts.Common;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Core.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class ProtectedController : ControllerBase
{
    [HttpGet]
    public ActionResult<ResponseBody<object>> Get()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var username = User.FindFirst(ClaimTypes.Name)?.Value;

        return Ok(
            new ResponseBody<object>
            {
                Message = "Protected endpoint accessed successfully",
                Payload = new { userId, username },
            }
        );
    }
}
