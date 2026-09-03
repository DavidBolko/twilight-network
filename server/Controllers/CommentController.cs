using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using System.Security.Claims;
using server.Dto.Comment;
using server;

[ApiController]
[Route("comments")]
public class CommentsController : ControllerBase
{
    private readonly AppDbContext _context;

    public CommentsController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{postId}")]
    public async Task<ActionResult<IEnumerable<object>>> GetComments(Guid postId)
    {
        var comments = await _context.Comments
            .Where(c => c.PostId == postId && !c.IsDeleted)
            .Include(c => c.Author)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                Author = new
                {
                    id = c.Author.Id,
                    firstName = c.Author.FirstName,
                    lastName = c.Author.LastName,
                    avatar = c.Author.Avatar
                }
            })
            .ToListAsync();

        return Ok(comments);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult> CreateComment([FromBody] CreateCommentDto data)
    {
        var userId = User.FindFirstValue("sub");
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var postExists = await _context.Posts.AnyAsync(p => p.Id == data.PostId && !p.IsDeleted);
        if (!postExists) return NotFound("Post not found.");

        var comment = new Comment
        {
            Content = data.Content,
            PostId = data.PostId,
            AuthorId = userId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Comments.Add(comment);
        await _context.SaveChangesAsync();

        var result = await _context.Comments
            .Where(c => c.Id == comment.Id)
            .Select(c => new
            {
                c.Id,
                c.Content,
                c.CreatedAt,
                Author = new
                {
                    id = c.Author.Id,
                    firstName = c.Author.FirstName,
                    lastName = c.Author.LastName,
                    avatar = c.Author.Avatar
                }
            })
            .FirstOrDefaultAsync();

        return CreatedAtAction(nameof(GetComments), new { postId = data.PostId }, result);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<ActionResult> UpdateComment(long id, [FromBody] CreateCommentDto data)
    {
        var userId = User.FindFirstValue("sub");
        var isElderOwl = User.IsInRole("ElderOwl");

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (comment == null) return NotFound("Comment not found.");

        if (comment.AuthorId != userId && !isElderOwl)
            return Forbid();

        comment.Content = data.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Comment updated successfully" });
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteComment(long id)
    {
        var userId = User.FindFirstValue("sub");
        var isElderOwl = User.IsInRole("ElderOwl");

        var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

        if (comment == null) return NotFound("Comment not found.");

        if (comment.AuthorId != userId && !isElderOwl)
            return Forbid();

        comment.IsDeleted = true;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Comment deleted successfully" });
    }
}