using System.ComponentModel.DataAnnotations;

namespace server.Dto.Auth;

public class LoginDto
{
    [Required]
    [EmailAddress]
    public string Email {get; set;} = String.Empty;

    [Required]
    [MinLength(6)]
    public string Password {get; set;} = String.Empty;
}