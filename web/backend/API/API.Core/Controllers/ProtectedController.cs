using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Contracts;

namespace API.Core.Controllers;

/// <summary>
///     Sample controller demonstrating an endpoint that requires JWT authentication.
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize(AuthenticationSchemes = "JWT")]
public class ProtectedController : ControllerBase
{
    /// <summary>
    ///     Returns the authenticated caller's user ID and username extracted from the JWT claims.
    /// </summary>
    /// <returns><c>userId</c> and <c>username</c> may be <c>null</c> if not present in the token.</returns>
    [HttpGet]
    public ActionResult<ResponseBody<object>> Get()
    {
        string? userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        string? username = User.FindFirst(ClaimTypes.Name)?.Value;

        return Ok(
            new ResponseBody<object>
            {
                Message = "Protected endpoint accessed successfully",
                Payload = new { userId, username },
            }
        );
    }
}
