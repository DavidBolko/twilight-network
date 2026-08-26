using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using server;
using Microsoft.EntityFrameworkCore;
[ApiController]
[Route("channels/{channelId}/messages")]
public class MessagesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IHubContext<ChatHub> _hubContext;

    public MessagesController(AppDbContext context, IHubContext<ChatHub> hubContext)
    {
        _context = context;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<IActionResult> GetMessages(long channelId)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == null) return Unauthorized();

        var isMember = await _context.ChannelParticipants
            .AnyAsync(p => p.ChannelId == channelId && p.UserId == currentUserId);
        if (!isMember) return Forbid();

        var messages = await _context.Messages
            .Where(m => m.ChannelId == channelId && m.DeletedAt == null)
            .OrderBy(m => m.CreatedAt)
            .Select(m => new
            {
                m.Id,
                m.Text,
                m.Type,
                m.CreatedAt,
                m.EditedAt,
                SenderId = m.SenderId,
                SenderName = m.Sender.UserName,
                SenderAvatar = m.Sender.Avatar,
            })
            .ToListAsync();

        return Ok(messages);
    }

    [HttpPost]
    public async Task<IActionResult> SendMessage(long channelId, [FromBody] SendMessageDto dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId == null) return Unauthorized();

        var isMember = await _context.ChannelParticipants
            .AnyAsync(p => p.ChannelId == channelId && p.UserId == currentUserId);
        if (!isMember) return Forbid();

        var message = new Message
        {
            ChannelId = channelId,
            SenderId = currentUserId,
            Text = dto.Text,
            Type = MessageType.TEXT,
        };

        _context.Messages.Add(message);

        var channel = await _context.Channels.FindAsync(channelId);
        if (channel != null) channel.LastMessageAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        var sender = await _context.Users.FindAsync(currentUserId);
        var messageDto = new MessageDto
        {
            Id = message.Id,
            ChannelId = message.ChannelId,
            Text = message.Text,
            Type = message.Type,
            CreatedAt = message.CreatedAt,
            SenderId = currentUserId,
            SenderName = sender?.UserName,
            SenderAvatar = sender?.Avatar
        };

        await _hubContext.Clients.Group(channelId.ToString()).SendAsync("NewMessage", messageDto);
        return Ok(messageDto);
    }
}

