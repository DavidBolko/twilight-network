using System.ComponentModel.DataAnnotations;

namespace server.Models;

public class Comment
{
    public long Id { get; set; }

    [Required]
    public string Content { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;

    public Guid PostId { get; set; }
    public Post Post { get; set; } = null!;

    public string AuthorId { get; set; } = string.Empty;
    public ApplicationUser Author { get; set; } = null!;
}