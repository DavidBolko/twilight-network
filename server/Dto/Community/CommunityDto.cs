namespace server.Dto.Community;

public class CommunityDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Image { get; set; }
    public long? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public int MembersCount { get; set; }
    public int PostCount { get; set; }
    public bool CanManage { get; set; }
    public List<MemberDto> Members { get; set; } = [];
}
