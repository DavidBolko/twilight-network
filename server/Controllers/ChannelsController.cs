using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server;

[ApiController]
[Route("channels")]
public class ChannelsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ChannelsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetChannels()
    {
        var currentUserId = User.FindFirstValue("sub");
        if (currentUserId == null) return Unauthorized();

        var channels = await _context.Channels
            .Where(c => c.Participants.Any(p => p.UserId == currentUserId))
            .Include(c => c.Participants)
                .ThenInclude(p => p.User)
            .OrderByDescending(c => c.LastMessageAt ?? c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Type,
                c.Title,
                c.LastMessageAt,
                Participants = c.Participants.Select(p => new
                {
                    p.UserId,
                    p.User.FirstName,
                    p.User.LastName,
                    p.User.Avatar,
                })
            })
            .ToListAsync();

        return Ok(channels);
    }
}