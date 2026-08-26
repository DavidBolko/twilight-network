using server.Models;

public class Notification
{
    public long Id { get; set; }
    public string UserId { get; set; }
    public NotificationType Type { get; set; }
    public string? ActorId { get; set; }
    public ApplicationUser? Actor { get; set; }
    public string? ResourceId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationType
{
    FriendRequest,
    FriendAccepted,
    //PostLiked,
    //PostComment,
}