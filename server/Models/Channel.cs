public enum ChannelType
{
    DIRECT,
    GROUP,
}

public class Channel
{
    public long Id { get; set; }

    public ChannelType Type { get; set; }

    public string? Title { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? LastMessageAt { get; set; }

    public ICollection<ChannelParticipant> Participants { get; set; } = new List<ChannelParticipant>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
}