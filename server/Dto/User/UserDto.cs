public class UserDto
{
    public string Id { get; set; } = null!;
    public string UserName { get; set; } = null!;
    public string? Avatar { get; set; }
    public string? About { get; set; }
    public bool IsElderOwl { get; set; }
    public int FollowersCount { get; set; }
    public int FollowingCount { get; set; }
}