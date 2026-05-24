using System.ComponentModel.DataAnnotations;

namespace server.Dto.Auth;

public class RegisterDto
{
    [Required]
    [StringLength(30, MinimumLength = 3)]
    [RegularExpression("^[A-Za-z0-9 _-]+$", ErrorMessage = "Name contains invalid characters.")]
    public string UserName {get; set;} = string.Empty;

    [Required]
    [EmailAddress]
    public string Email {get; set;} = String.Empty;

    [Required]
    [MinLength(6)]
    public string Password {get; set;} = String.Empty;
    
    [Required]
    [MinLength(6)]
    public string Password2 {get; set;} = String.Empty;
}