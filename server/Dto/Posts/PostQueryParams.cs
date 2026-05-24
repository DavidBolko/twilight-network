namespace server.Dto.Posts;

public class PostQueryParameters
{
    public int Page { get; set; } = 0;
    public int Size { get; set; } = 10;

    public string Sort { get; set; } = "hot";
    public string Time { get; set; } = "all";

    public Guid? CommunityId { get; set; }
    public string? AuthorId { get; set; }

    public bool Saved { get; set; } = false;
}