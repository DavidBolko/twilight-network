namespace server.Models;

public enum FriendshipStatus
{
    Pending = 0,
    Accepted = 1,
    Declined = 2,
    Blocked = 3,
}

public class Friendship
{
    public long Id { get; set; }

    public string RequesterId { get; set; } = null!;
    public ApplicationUser Requester { get; set; } = null!;

    public string AddresseeId { get; set; } = null!;
    public ApplicationUser Addressee { get; set; } = null!;

    public FriendshipStatus Status { get; set; } = FriendshipStatus.Pending;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RespondedAt { get; set; }
    public string? BlockedByUserId { get; set; }
}