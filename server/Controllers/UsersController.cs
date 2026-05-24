using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server;
using server.Models;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;
    public UsersController(AppDbContext context) => _context = context;

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(string id)
    {
        var user = await _context.Users
            .Select(u => new UserDto
            {
                Id = u.Id,
                UserName = u.UserName!,
                Avatar = u.Avatar,
                About = u.About,
                IsElderOwl = u.IsElderOwl,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Following.Count
            })
            .FirstOrDefaultAsync(u => u.Id == id);

        if (user == null) return NotFound();
        return Ok(user);
    }

    [HttpGet("{id}/posts")]
    public async Task<IActionResult> GetUserPosts(string id)
    {
        var posts = await _context.Posts
            .Include(p => p.Author)
            .Where(p => p.AuthorId == id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync();
        return Ok(posts);
    }

    [HttpGet("{id}/communities")]
    public async Task<IActionResult> GetUserCommunities(string id)
    {
        var user = await _context.Users
            .Include(u => u.Communities)
            .FirstOrDefaultAsync(u => u.Id == id);

        return Ok(user?.Communities ?? new List<Community>());
    }
}