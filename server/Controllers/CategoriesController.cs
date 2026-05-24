using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server;
[ApiController]

[Route("categories")]
public class CategoriesController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoriesController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<ActionResult> GetCategories()
    {
        var categories = await _context.Categories
            .Select(c => new { id = c.Id, name = c.Name })
            .ToListAsync();
            
        return Ok(categories);
    }
}