using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server;
using server.Models;

[ApiController]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _context;

    public UsersController(AppDbContext context)
    {
        _context = context;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(id))
            return Unauthorized();

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == id);

        var firstName = User.FindFirstValue("given_name");
        var lastName = User.FindFirstValue("family_name");

        if (user == null)
        {
            user = new ApplicationUser
            {
                Id = id,
                Email = User.FindFirstValue("email"),
                FirstName = firstName,
                LastName = lastName,
                About = null,
                Avatar = "/avatar.png"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
        }
        else
        {
            // voliteľné: udržiavať meno/priezvisko v sync s Keycloakom pri každom prihlásení
            var changed = false;

            if (user.FirstName != firstName)
            {
                user.FirstName = firstName;
                changed = true;
            }

            if (user.LastName != lastName)
            {
                user.LastName = lastName;
                changed = true;
            }

            if (changed)
                await _context.SaveChangesAsync();
        }

        return Ok(new CurrentUserDto
        {
            Id = user.Id,
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Avatar = user.Avatar
        });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return BadRequest("Id must be provided.");

        var user = await _context.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Avatar = u.Avatar,
                About = u.About,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Following.Count
            })
            .FirstOrDefaultAsync();

        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(
        [FromQuery] string? name,
        [FromQuery] int page = 0,
        [FromQuery] int size = 10)
    {
        var query = _context.Users.AsQueryable();

        if (!string.IsNullOrWhiteSpace(name))
        {
            query = query.Where(u =>
                (u.FirstName != null && EF.Functions.ILike(u.FirstName, $"%{name}%")) ||
                (u.LastName != null && EF.Functions.ILike(u.LastName, $"%{name}%")));
        }

        var users = await query
            .Skip(page * size)
            .Take(size)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Avatar = u.Avatar,
                About = u.About,
                FollowersCount = u.Followers.Count,
                FollowingCount = u.Following.Count
            })
            .ToListAsync();

        return Ok(users);
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