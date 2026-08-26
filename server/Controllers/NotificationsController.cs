using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server;

[ApiController]
[Route("notifications")]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _context;

    public NotificationsController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetNotifications()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == null) return Unauthorized();

        var notifications = await _context.Notifications
            .Where(n => n.UserId == currentUserId)
            .Include(n => n.Actor)
            .OrderByDescending(n => n.CreatedAt)
            .Select(n => new NotificationDto
            {
                Id = n.Id,
                Type = n.Type.ToString(),
                IsRead = n.IsRead,
                CreatedAt = n.CreatedAt,
                ResourceId = n.ResourceId,
                Actor = n.Actor == null ? null : new AuthorDto
                {
                    Id = n.Actor.Id,
                    UserName = n.Actor.UserName!,
                    Avatar = n.Actor.Avatar,
                }
            })
            .ToListAsync();
        return Ok(notifications);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == null) return Unauthorized();

        await _context.Notifications
            .Where(n => n.UserId == currentUserId && !n.IsRead)
            .ExecuteUpdateAsync(n => n.SetProperty(x => x.IsRead, true));

        return Ok();
    }
}