using System.ComponentModel.DataAnnotations;

namespace server.Models;

public class Category
{
    public int Id { get; set; }

    [Required]
    [MaxLength(64)]
    public string Name { get; set; } = string.Empty;

    public ICollection<Community> Communities { get; set; } = new List<Community>();
}