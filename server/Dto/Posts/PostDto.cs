public class PostDto
{
    public Guid Id { get; set; }
    public string? Title { get; set; }
    public string? Text { get; set; }

    public string Type { get; set; } = string.Empty;

    public DateTime CreatedAt { get; set; }

    public int LikesCount { get; set; }
    public int CommentsCount { get; set; }

    public bool IsLiked { get; set; }
    public bool IsSaved { get; set; }

    public List<string> Images { get; set; } = new List<string>();

    public AuthorDto Author { get; set; } = null!;

    public CommunitySummaryDto? Community { get; set; }
}