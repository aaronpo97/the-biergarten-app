using Microsoft.AspNetCore.Mvc;

namespace API.Core.Controllers;

/// <summary>
///     Handles requests that do not match any other route, used as the application's fallback controller.
/// </summary>
/// <remarks>
///     Wired up as the fallback target via <c>app.MapFallbackToController("Handle404", "NotFound")</c> in
///     <c>Program.cs</c>.
/// </remarks>
[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("error")] // required
public class NotFoundController : ControllerBase
{
    /// <summary>
    ///     Returns a 404 response for any request that did not match a route.
    /// </summary>
    [HttpGet("404")] //required
    public IActionResult Handle404()
    {
        return NotFound(new { message = "Route not found." });
    }
}
