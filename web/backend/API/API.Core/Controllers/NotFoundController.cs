using Microsoft.AspNetCore.Mvc;

namespace API.Core.Controllers;

/// <summary>
///     Handles requests that do not match any other route, used as the application's fallback controller.
/// </summary>
/// <remarks>
///     Excluded from API explorer/Swagger output via <c>[ApiExplorerSettings(IgnoreApi = true)]</c>.
///     Wired up as the fallback target via <c>app.MapFallbackToController("Handle404", "NotFound")</c> in
///     <c>Program.cs</c>.
/// </remarks>
[ApiController]
[ApiExplorerSettings(IgnoreApi = true)]
[Route("error")] // required
public class NotFoundController : ControllerBase
{
    /// <summary>
    ///     Returns a generic 404 response for any request that did not match a defined route.
    /// </summary>
    /// <returns>A <c>404 Not Found</c> result with a JSON body containing a "Route not found." message.</returns>
    [HttpGet("404")] //required
    public IActionResult Handle404()
    {
        return NotFound(new { message = "Route not found." });
    }
}