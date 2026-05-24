using System.ComponentModel.DataAnnotations;

namespace server.Dto.Comment;

public class CreateCommentDto
{
    [Required(ErrorMessage = "Content is required.")]
    [MinLength(1, ErrorMessage = "Comment cannot be empty.")]
    [MaxLength(1000, ErrorMessage = "Comment is too long (max 1000 characters).")]
    public string Content { get; set; } = string.Empty;

    [Required]
    public Guid PostId { get; set; }
}