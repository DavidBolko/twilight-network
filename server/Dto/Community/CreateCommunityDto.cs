// Dto/Community/CreateCommunityDto.cs
using System.ComponentModel.DataAnnotations;

namespace server.Dto.Community;

public class CreateCommunityDto
{
    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [Required]
    public int CategoryId { get; set; }

    public IFormFile? Image { get; set; }
}