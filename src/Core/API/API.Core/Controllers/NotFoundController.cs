using Microsoft.AspNetCore.Mvc;

namespace WebAPI.Controllers
{
    [ApiController]
    [ApiExplorerSettings(IgnoreApi = true)]
    [Route("error")] // required
    public class NotFoundController : ControllerBase
    {
        [HttpGet("404")] //required
        public IActionResult Handle404()
        {
            return NotFound(new { message = "Route not found." });
        }
    }
}
