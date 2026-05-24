using System.ComponentModel.DataAnnotations;

namespace server.Models;

public class ImagePost
{
    public Guid Id { get; set; }

    public string Url { get; set; } = string.Empty;

    public int Position { get; set; }

    public Guid PostId { get; set; }

    public Post Post { get; set; } = null!;
}