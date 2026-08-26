using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using server.Models;

namespace server;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> opts) : base(opts)
    {

    }

    public DbSet<Category> Categories { get; set; }
    public DbSet<Community> Communities { get; set; }
    public DbSet<Post> Posts { get; set; }
    public DbSet<ImagePost> ImagePosts { get; set; }
    public DbSet<Channel> Channels { get; set; }
    public DbSet<ChannelParticipant> ChannelParticipants { get; set; }
    public DbSet<Notification> Notifications { get; set; }
    public DbSet<Message> Messages { get; set; }
    public DbSet<Comment> Comments { get; set; }
    public DbSet<Friendship> Friendships => Set<Friendship>();
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // 1. Unikátne indexy pre rýchle vyhľadávanie
        builder.Entity<Community>().HasIndex(c => c.Name).IsUnique();
        builder.Entity<Category>().HasIndex(c => c.Name).IsUnique();

        // 2. Globálny filter: Nechceme vidieť posty a komentáre s IsDeleted = true
        builder.Entity<Post>().HasQueryFilter(p => !p.IsDeleted);
        builder.Entity<Comment>().HasQueryFilter(c => !c.IsDeleted);

        // 3. User -> Community (Creator)
        builder.Entity<Community>()
            .HasOne(c => c.Creator)
            .WithMany(u => u.CreatedCommunities)
            .HasForeignKey(c => c.CreatorId)
            .OnDelete(DeleteBehavior.Restrict);

        // 4. Many-to-Many pre komunity
        builder.Entity<Community>()
            .HasMany(c => c.Members)
            .WithMany(u => u.Communities)
            .UsingEntity(j => j.ToTable("UserCommunity"));

        builder.Entity<Community>()
            .HasMany(c => c.NightOwls)
            .WithMany(u => u.ModeratedCommunities)
            .UsingEntity(j => j.ToTable("CommunityNightOwls"));

        // 5. Post -> Community (Voliteľné pre posty mimo komunity)
        builder.Entity<Post>()
            .HasOne(p => p.Community)
            .WithMany(c => c.Posts)
            .HasForeignKey(p => p.CommunityId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade); // Ak sa predsa zmaže komunita, zmažú sa aj jej posty v DB

        // 6. User -> Post (Author)
        builder.Entity<Post>()
            .HasOne(p => p.Author)
            .WithMany(u => u.Posts)
            .HasForeignKey(p => p.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // 7. Many-to-Many pre príspevky
        builder.Entity<Post>()
            .HasMany(p => p.Likes)
            .WithMany(u => u.LikedPosts)
            .UsingEntity(j => j.ToTable("PostLikes"));

        builder.Entity<Post>()
            .HasMany(p => p.SavedBy)
            .WithMany(u => u.SavedPosts)
            .UsingEntity(j => j.ToTable("UserSavedPosts"));

        // 8. User -> Comment (Author)
        builder.Entity<Comment>()
            .HasOne(c => c.Author)
            .WithMany(u => u.Comments)
            .HasForeignKey(c => c.AuthorId)
            .OnDelete(DeleteBehavior.Restrict);

        // 9. Many-to-Many: Systém sledovania používateľov (Followers)
        builder.Entity<ApplicationUser>()
            .HasMany(u => u.Followers)
            .WithMany(u => u.Following)
            .UsingEntity(j => j.ToTable("UserFollowers"));

        builder.Entity<Friendship>()
            .HasOne(f => f.Requester)
            .WithMany(u => u.SentRequests)
            .HasForeignKey(f => f.RequesterId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<Friendship>()
            .HasOne(f => f.Addressee)
            .WithMany(u => u.ReceivedRequests)
            .HasForeignKey(f => f.AddresseeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Entity<ChannelParticipant>()
.HasKey(cp => new { cp.ChannelId, cp.UserId });
    }
}