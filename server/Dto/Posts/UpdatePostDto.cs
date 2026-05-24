using Microsoft.AspNetCore.Http;

namespace server.Dto.Posts;

public class UpdatePostDto
{
    public string? Text { get; set; }

    public List<IFormFile> Images { get; set; } = [];

    public List<string> RemoveImages { get; set; } = [];
}