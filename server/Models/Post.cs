using System.ComponentModel.DataAnnotations;
using server.Models;

public enum PostType
{
    Text,
    Image,
    Link,
    Video
}

public class Post
{
    public Guid Id { get; set; }

    [MaxLength(300)]
    public string? Title { get; set; }
    public string? Text { get; set; }
    public PostType Type { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    public Guid? CommunityId { get; set; }
    public Community? Community { get; set; }

    public string AuthorId { get; set; } = string.Empty;
    public ApplicationUser Author { get; set; } = null!;

    public ICollection<ImagePost> ImagePosts { get; set; } = new List<ImagePost>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    public ICollection<ApplicationUser> Likes { get; set; } = new List<ApplicationUser>();
    public ICollection<ApplicationUser> SavedBy { get; set; } = new List<ApplicationUser>();
}