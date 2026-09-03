using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using server;
using server.Models;

[ApiController]
[Route("friendship")]
public class FriendshipController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ChannelService _channelService;

    public FriendshipController(
        AppDbContext context,
        IHubContext<NotificationHub> hubContext,
        ChannelService channelService)
    {
        _context = context;
        _hubContext = hubContext;
        _channelService = channelService;
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetFriendship(string id)
    {
        var currentUserId = User.FindFirstValue("sub");

        if (currentUserId == null)
            return Unauthorized("Not logged in.");

        var user = await _context.Users.FindAsync(currentUserId);

        if (user == null)
            return Unauthorized("User not found.");

        var user2 = await _context.Users.FindAsync(id);

        if (user2 == null)
            return NotFound("User doesn't exist.");

        var exists = await _context.Friendships.AnyAsync(f =>
            (
                (f.RequesterId == currentUserId && f.AddresseeId == id)
                ||
                (f.RequesterId == id && f.AddresseeId == currentUserId)
            )
            && f.Status == FriendshipStatus.Accepted
        );

        return Ok(exists);
    }

    [HttpPost("{id}")]
    public async Task<IActionResult> SendRequest(string id)
    {
        var currentUserId = User.FindFirstValue("sub");

        if (currentUserId == null)
            return Unauthorized("Not logged in.");

        var user = await _context.Users.FindAsync(currentUserId);

        if (user == null)
            return Unauthorized("User not found.");

        var receiver = await _context.Users.FindAsync(id);

        if (receiver == null)
            return NotFound("User doesn't exist.");

        if (currentUserId == id)
            return BadRequest("Cannot add yourself.");

        var exists = await _context.Friendships.AnyAsync(f =>
            (f.RequesterId == currentUserId && f.AddresseeId == id)
            ||
            (f.RequesterId == id && f.AddresseeId == currentUserId)
        );

        if (exists)
            return Conflict("Friendship already exists.");

        var friendship = new Friendship
        {
            AddresseeId = receiver.Id,
            RequesterId = currentUserId
        };

        _context.Friendships.Add(friendship);
        await _context.SaveChangesAsync();

        var notification = new Notification
        {
            UserId = receiver.Id,
            ActorId = currentUserId,
            ResourceId = friendship.Id.ToString(),
            Type = NotificationType.FriendRequest
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var notificationDto = new NotificationDto
        {
            Id = notification.Id,
            Type = notification.Type.ToString(),
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ResourceId = notification.ResourceId,

            Actor = new AuthorDto
            {
                Id = user.Id,
                FullName = $"{user.FirstName} {user.LastName}".Trim(),
                Avatar = user.Avatar
            }
        };

        await _hubContext.Clients
            .User(receiver.Id)
            .SendAsync("NewNotification", notificationDto);

        return Ok();
    }

    [HttpPatch("{id}/accept")]
    public async Task<IActionResult> AcceptRequest(long id)
    {
        var currentUserId = User.FindFirstValue("sub");

        if (currentUserId == null)
            return Unauthorized();

        var friendship = await _context.Friendships.FindAsync(id);

        if (friendship == null)
            return NotFound();

        if (friendship.AddresseeId != currentUserId)
            return Forbid();

        if (friendship.Status != FriendshipStatus.Pending)
        {
            return BadRequest("Request is not pending.");
        }

        friendship.Status = FriendshipStatus.Accepted;
        friendship.RespondedAt = DateTime.UtcNow;

        var notification = new Notification
        {
            UserId = friendship.RequesterId,
            ActorId = currentUserId,
            ResourceId = friendship.Id.ToString(),
            Type = NotificationType.FriendAccepted
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        var currentUser = await _context.Users.FindAsync(currentUserId);

        var notificationDto = new NotificationDto
        {
            Id = notification.Id,
            Type = notification.Type.ToString(),
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ResourceId = notification.ResourceId,

            Actor = currentUser == null
                ? null
                : new AuthorDto
                {
                    Id = currentUser.Id,
                    FullName = $"{currentUser.FirstName} {currentUser.LastName}".Trim(),
                    Avatar = currentUser.Avatar
                }
        };

        await _hubContext.Clients
            .User(friendship.RequesterId)
            .SendAsync("NewNotification", notificationDto);

        await _channelService.CreateDirectChannelAsync(
            currentUserId,
            friendship.RequesterId
        );

        return Ok();
    }

    [HttpPatch("{id}/decline")]
    public async Task<IActionResult> DeclineRequest(long id)
    {
        var currentUserId = User.FindFirstValue("sub");

        if (currentUserId == null)
            return Unauthorized();

        var friendship = await _context.Friendships.FindAsync(id);

        if (friendship == null)
            return NotFound();

        if (friendship.AddresseeId != currentUserId)
            return Forbid();

        if (friendship.Status != FriendshipStatus.Pending)
        {
            return BadRequest("Request is not pending.");
        }

        friendship.Status = FriendshipStatus.Declined;
        friendship.RespondedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok();
    }
}