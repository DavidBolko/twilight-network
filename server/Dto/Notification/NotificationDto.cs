public class NotificationDto
{
    public long Id { get; set; }
    public string Type { get; set; } = "";
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ResourceId { get; set; }
    public AuthorDto? Actor { get; set; }
}