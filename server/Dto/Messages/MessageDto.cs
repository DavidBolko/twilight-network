public class MessageDto
{
    public long Id { get; set; }
    public long ChannelId { get; set; }
    public string Text { get; set; } = string.Empty;
    public MessageType Type { get; set; }
    public DateTime CreatedAt { get; set; }

    public string? SenderId { get; set; }
    public string? SenderFirstName { get; set; }
    public string? SenderLastName { get; set; }
    public string? SenderAvatar { get; set; }
}