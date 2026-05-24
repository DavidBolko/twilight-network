namespace server.Dto.Posts;

public class CreatePostDto
{
    public string? Title { get; set; }
    public string? Text { get; set; }
    public PostType Type { get; set; }

    public Guid? CommunityId { get; set; }

    public List<IFormFile> Images { get; set; } = [];
}