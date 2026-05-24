using System.ComponentModel.DataAnnotations;

namespace server.Models;

public class Community
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public string? Image { get; set; }

    public string CreatorId { get; set; } = string.Empty;
    public ApplicationUser Creator { get; set; } = null!;

    public int? CategoryId { get; set; }
    public Category? Category { get; set; }

    public ICollection<Post> Posts { get; set; } = new List<Post>();

    public ICollection<ApplicationUser> Members { get; set; } = new List<ApplicationUser>();
    public ICollection<ApplicationUser> NightOwls { get; set; } = new List<ApplicationUser>();
}

