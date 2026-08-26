using server.Models;

public enum ChannelRole
{
    MEMBER,
    ADMIN,
}

public class ChannelParticipant
{
    public long ChannelId { get; set; }
    public Channel Channel { get; set; } = null!;

    public string UserId { get; set; }
    public ApplicationUser User { get; set; } = null!;

    public ChannelRole Role { get; set; } = ChannelRole.MEMBER;

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

    public string? Nickname { get; set; }

    public long? LastReadMessageId { get; set; }
    public DateTime? LastReadAt { get; set; }
}