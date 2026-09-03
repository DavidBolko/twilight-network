namespace server.Models;

public class ApplicationUser
{
    public string Id { get; set; } = null!;

    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Email { get; set; }

    public string? About { get; set; }
    public string? Avatar { get; set; }

    public ICollection<Post> Posts { get; set; } = new List<Post>();

    public ICollection<Community> CreatedCommunities { get; set; } = new List<Community>();

    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<Community> Communities { get; set; } = new List<Community>();

    public ICollection<Community> ModeratedCommunities { get; set; } = new List<Community>();

    public ICollection<Post> LikedPosts { get; set; } = new List<Post>();

    public ICollection<Post> SavedPosts { get; set; } = new List<Post>();

    public ICollection<ApplicationUser> Followers { get; set; } = new List<ApplicationUser>();

    public ICollection<ApplicationUser> Following { get; set; } = new List<ApplicationUser>();

    public ICollection<Friendship> SentRequests { get; set; } = new List<Friendship>();

    public ICollection<Friendship> ReceivedRequests { get; set; } = new List<Friendship>();
}