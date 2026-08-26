using server.Models;

public enum MessageType
{
    TEXT,
    IMAGE,
    FILE,
}

public class Message
{
    public long Id { get; set; }

    public long ChannelId { get; set; }
    public Channel Channel { get; set; } = null!;

    public string SenderId { get; set; }
    public ApplicationUser Sender { get; set; } = null!;

    public MessageType Type { get; set; } = MessageType.TEXT;

    public string? Text { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? EditedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}