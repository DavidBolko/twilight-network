using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.Dto.Community;
using server.Services;
using System.Security.Claims;

namespace server.Controllers;

[ApiController]
[Route("communities")]
public class CommunitiesController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ImageService _imageService;

    public CommunitiesController(AppDbContext context, ImageService imageService)
    {
        _context = context;
        _imageService = imageService;
    }

    private string? CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier);

    [HttpGet("{id:guid}")]
    public async Task<ActionResult> GetCommunity(Guid id)
    {
        var currentUserId = CurrentUserId;

        var community = await _context.Communities
            .Where(c => c.Id == id)
            .Select(c => new CommunityDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Image = c.Image,
                CategoryId = c.CategoryId,
                CategoryName = c.Category != null ? c.Category.Name : null,
                MembersCount = c.Members.Count,
                PostCount = c.Posts.Count,
                CanManage = currentUserId != null && (c.CreatorId == currentUserId || c.NightOwls.Any(m => m.Id == currentUserId)),
                Members = c.Members.Select(m => new MemberDto
                {
                    Id = m.Id,
                    UserName = m.UserName ?? "",
                    Avatar = m.Avatar,
                    IsNightOwl = c.NightOwls.Any(mod => mod.Id == m.Id),
                    IsCreator = c.CreatorId == m.Id,
                }).ToList()
            })
            .FirstOrDefaultAsync();

        if (community == null)
            return NotFound(new { message = "Community not found." });

        return Ok(community);
    }

    [HttpPut("{id:guid}/join")]
    public async Task<ActionResult> ToggleJoin(Guid id)
    {
        var userId = CurrentUserId;
        if (userId == null) return Unauthorized();

        var community = await _context.Communities.Include(c => c.Members.Where(u => u.Id == userId)).FirstOrDefaultAsync(c => c.Id == id);

        if (community == null) return NotFound();

        var user = community.Members.FirstOrDefault();
        if (user != null)
        {
            community.Members.Remove(user);
        }
        else
        {
            var u = await _context.Users.FindAsync(userId);
            if (u == null) return Unauthorized();
            community.Members.Add(u);
        }

        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpGet]
    public async Task<ActionResult> GetCommunities([FromQuery] string? userId, [FromQuery] string? name, [FromQuery] int? page, [FromQuery] int? size)
    {
        var currentUserId = CurrentUserId;

        var query = _context.Communities.AsQueryable();

        if (!string.IsNullOrEmpty(userId))
            query = query.Where(c => c.Members.Any(m => m.Id == userId));
        if (!string.IsNullOrEmpty(name))
            query = query.Where(c => EF.Functions.ILike(c.Name, $"%{name}%"));
        if (page != null && size != null) query = query.Skip(page.Value * size.Value).Take(size.Value);

        var communities = await query
            .Select(c => new CommunityDto
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                Image = c.Image,
                CategoryId = c.CategoryId,
                CategoryName = c.Category != null ? c.Category.Name : null,
                MembersCount = c.Members.Count,
                Members = c.Members.Select(m => new MemberDto
                {
                    Id = m.Id,
                    UserName = m.UserName ?? "",
                    Avatar = m.Avatar,
                    IsNightOwl = c.NightOwls.Any(mod => mod.Id == m.Id),
                    IsCreator = c.CreatorId == m.Id,
                }).ToList()
            })
            .ToListAsync();

        return Ok(communities);
    }

    [Authorize]
    [HttpPost("create")]
    public async Task<ActionResult> Create([FromForm] CreateCommunityDto dto)
    {
        var userId = CurrentUserId;
        var user = await _context.Users.FindAsync(userId);
        if (user == null || userId == null) return Unauthorized();

        if (await _context.Communities.AnyAsync(c => c.Name.ToLower() == dto.Name.ToLower()))
            return Conflict(new { message = "A community with this name already exists." });

        string? imagePath = $"/uploads/communities/community{Random.Shared.Next(1, 4)}.png";
        if (dto.Image != null)
        {
            try
            {
                imagePath = await _imageService.SaveImageAsync(dto.Image, "communities");
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        var community = new Community
        {
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            CategoryId = dto.CategoryId,
            CreatorId = userId,
            Image = imagePath,
        };

        community.Members.Add(user);
        _context.Communities.Add(community);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetCommunity), new { id = community.Id }, new { id = community.Id });
    }
}