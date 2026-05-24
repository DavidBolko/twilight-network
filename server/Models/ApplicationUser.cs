using Microsoft.AspNetCore.Identity;

namespace server.Models;

public class ApplicationUser : IdentityUser
{
    public string? About { get; set; }
    public string? Avatar { get; set; }
    public bool IsElderOwl { get; set; }

    public ICollection<Post> Posts { get; set; } = new List<Post>();
    public ICollection<Community> CreatedCommunities { get; set; } = new List<Community>();
    public ICollection<Comment> Comments { get; set; } = new List<Comment>();

    // Many-to-Many - Komunity
    public ICollection<Community> Communities { get; set; } = new List<Community>(); // Člen
    public ICollection<Community> ModeratedCommunities { get; set; } = new List<Community>(); // Moderátor

    // Many-to-Many - Príspevky
    public ICollection<Post> LikedPosts { get; set; } = new List<Post>();
    public ICollection<Post> SavedPosts { get; set; } = new List<Post>();

    // Many-to-Many - Sledovanie (Followers)
    public ICollection<ApplicationUser> Followers { get; set; } = new List<ApplicationUser>();
    public ICollection<ApplicationUser> Following { get; set; } = new List<ApplicationUser>();
}
