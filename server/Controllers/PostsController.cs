using System.Data;
using System.Security.Claims;
using ImageMagick;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Dto.Posts;
using server.Models;
using server.Services;

namespace server.Controllers;

[ApiController]
[Route("posts")]
public class PostsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ImageService _imageService;

    public PostsController(AppDbContext db, ImageService imageService)
    {
        _db = db;
        _imageService = imageService;
    }

    [HttpPost]
    [Authorize]
    public async Task<IActionResult> CreatePost([FromForm] CreatePostDto data)
    {
        var authorId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (authorId == null) return Unauthorized();

        if (data.CommunityId.HasValue)
        {
            var communityExists = await _db.Communities.AnyAsync(c => c.Id == data.CommunityId.Value);

            if (!communityExists)
            {
                return BadRequest(new { message = "Community doesn't exist." });
            }
        }

        var images = data.Images ?? [];
        var hasImages = images.Count > 0;
        var hasText = !string.IsNullOrWhiteSpace(data.Text);

        if (!hasImages && !hasText)
        {
            return BadRequest(new { message = "Text is required when there are no images." });
        }

        try
        {
            _imageService.ValidateImages(images);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        var post = new Post
        {
            Title = string.IsNullOrWhiteSpace(data.Title) ? null : data.Title.Trim(),
            Text = string.IsNullOrWhiteSpace(data.Text) ? null : data.Text.Trim(),
            Type = hasImages ? PostType.Image : PostType.Text,
            CommunityId = data.CommunityId,
            AuthorId = authorId,
            CreatedAt = DateTime.UtcNow
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();

        if (hasImages)
        {
            try
            {
                for (var i = 0; i < images.Count; i++)
                {
                    var imageUrl = await _imageService.SaveImageAsync(images[i], "posts");

                    var imagePost = new ImagePost
                    {
                        PostId = post.Id,
                        Url = imageUrl,
                        Position = i
                    };

                    _db.ImagePosts.Add(imagePost);
                }

                await _db.SaveChangesAsync();
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch
            {
                return BadRequest(new { message = "Invalid image file." });
            }
        }

        return CreatedAtAction(
            nameof(GetPost),
            new { id = post.Id },
            new
            {
                id = post.Id,
                message = "Post created successfully"
            }
        );
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var post = await _db.Posts
            .Include(p => p.Author)
            .Include(p => p.Community)
            .Include(p => p.ImagePosts)
            .Include(p => p.Likes)
            .Include(p => p.SavedBy)
            .Include(p => p.Comments)
            .Where(p => p.Id == id)
            .Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Text = p.Text,
                Type = p.Type.ToString(),
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,

                IsLiked = currentUserId != null && p.Likes.Any(u => u.Id == currentUserId),
                IsSaved = currentUserId != null && p.SavedBy.Any(u => u.Id == currentUserId),

                Images = p.ImagePosts.OrderBy(i => i.Position).Select(i => i.Url).ToList(),

                Author = new AuthorDto
                {
                    Id = p.Author.Id,
                    UserName = p.Author.UserName!,
                    Avatar = p.Author.Avatar,
                    IsElderOwl = p.Author.IsElderOwl
                },

                Community = p.Community != null ? new CommunitySummaryDto
                {
                    Id = p.Community.Id,
                    Name = p.Community.Name,
                    Image = p.Community.Image
                } : null
            })
            .FirstOrDefaultAsync();

        if (post == null)
        {
            return NotFound();
        }

        return Ok(post);
    }

    [HttpGet]
    public async Task<IActionResult> GetPosts([FromQuery] PostQueryParameters queryParams)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        var query = _db.Posts.Include(p => p.Author).Include(p => p.Community).AsQueryable();

        if (queryParams.CommunityId.HasValue)
        {
            query = query.Where(p => p.CommunityId == queryParams.CommunityId.Value);
        }

        if (queryParams.Saved)
        {
            if (currentUserId == null) return Unauthorized();
            query = query.Where(p => p.SavedBy.Any(u => u.Id == currentUserId));
        }

        if (!string.IsNullOrEmpty(queryParams.AuthorId))
        {
            query = query.Where(p => p.AuthorId == queryParams.AuthorId);
        }

        if (!string.IsNullOrEmpty(queryParams.Query))
        {
            query = query.Where(p =>
                (p.Title != null && EF.Functions.ILike(p.Title, $"%{queryParams.Query}%")) ||
                (p.Text != null && EF.Functions.ILike(p.Text, $"%{queryParams.Query}%")));
        }

        if (queryParams.Time != "all")
        {
            var timeLimit = queryParams.Time.ToLower() switch
            {
                "hour" => DateTime.UtcNow.AddHours(-1),
                "day" => DateTime.UtcNow.AddDays(-1),
                "week" => DateTime.UtcNow.AddDays(-7),
                "month" => DateTime.UtcNow.AddMonths(-1),
                "year" => DateTime.UtcNow.AddYears(-1),
                _ => DateTime.MinValue
            };

            query = query.Where(p => p.CreatedAt >= timeLimit);
        }

        query = queryParams.Sort.ToLower() switch
        {
            "new" => query.OrderByDescending(p => p.CreatedAt),
            "top" => query.OrderByDescending(p => p.Likes.Count),
            "hot" => query.OrderByDescending(p => p.Likes.Count).ThenByDescending(p => p.CreatedAt),
            _ => query.OrderByDescending(p => p.CreatedAt)
        };

        var posts = await query
            .Skip(queryParams.Page * queryParams.Size)
            .Take(queryParams.Size)
            .Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Text = p.Text,
                Type = p.Type.ToString(),
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,

                IsLiked = currentUserId != null && p.Likes.Any(u => u.Id == currentUserId),
                IsSaved = currentUserId != null && p.SavedBy.Any(u => u.Id == currentUserId),

                Images = p.ImagePosts.OrderBy(i => i.Position).Select(i => i.Url).ToList(),

                Author = new AuthorDto
                {
                    Id = p.Author.Id,
                    UserName = p.Author.UserName!,
                    Avatar = p.Author.Avatar,
                    IsElderOwl = p.Author.IsElderOwl
                },

                Community = p.Community != null ? new CommunitySummaryDto
                {
                    Id = p.Community.Id,
                    Name = p.Community.Name,
                    Image = p.Community.Image
                } : null
            })
            .ToListAsync();

        return Ok(posts);
    }

    [HttpPut("{id:guid}/like")]
    [Authorize]
    public async Task<IActionResult> ToggleLike(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var post = await _db.Posts.Include(p => p.Likes).FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return Unauthorized();

        var alreadyLiked = post.Likes.Any(u => u.Id == userId);

        if (alreadyLiked)
        {
            post.Likes.Remove(user);
        }
        else
        {
            post.Likes.Add(user);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            liked = !alreadyLiked,
            likesCount = post.Likes.Count
        });
    }

    [HttpPut("{id:guid}/save")]
    [Authorize]
    public async Task<IActionResult> ToggleSave(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var post = await _db.Posts
            .Include(p => p.SavedBy)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return Unauthorized();

        var alreadySaved = post.SavedBy.Any(u => u.Id == userId);

        if (alreadySaved)
        {
            post.SavedBy.Remove(user);
        }
        else
        {
            post.SavedBy.Add(user);
        }

        await _db.SaveChangesAsync();

        return Ok(new
        {
            saved = !alreadySaved
        });
    }

    [HttpDelete("{id:guid}")]
    [Authorize]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var post = await _db.Posts
            .Include(p => p.Likes)
            .Include(p => p.SavedBy)
            .Include(p => p.ImagePosts)
            .Include(p => p.Comments)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null) return NotFound();

        if (post.AuthorId != userId)
        {
            return Forbid();
        }

        post.Likes.Clear();
        post.SavedBy.Clear();

        _db.ImagePosts.RemoveRange(post.ImagePosts);
        _db.Comments.RemoveRange(post.Comments);

        _db.Posts.Remove(post);

        await _db.SaveChangesAsync();

        return NoContent();
    }

    [HttpPut("{id:long}")]
    [Authorize]
    public async Task<IActionResult> UpdatePost(Guid id, [FromForm] UpdatePostDto data)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var isElderOwl = await _db.Users
            .Where(u => u.Id == userId)
            .Select(u => u.IsElderOwl)
            .FirstOrDefaultAsync();

        var post = await _db.Posts
            .Include(p => p.ImagePosts)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (post == null)
        {
            return NotFound();
        }

        if (post.AuthorId != userId && !isElderOwl)
        {
            return Forbid();
        }

        var imagesToRemove = post.ImagePosts
            .Where(i => data.RemoveImages.Contains(i.Url))
            .ToList();

        var remainingImages = post.ImagePosts
            .Where(i => !imagesToRemove.Contains(i))
            .OrderBy(i => i.Position)
            .ToList();

        var newImages = data.Images ?? [];
        var finalImageCount = remainingImages.Count + newImages.Count;

        if (finalImageCount > 10)
        {
            return BadRequest(new { message = "Maximum number of images is 10." });
        }

        var trimmedText = data.Text?.Trim();

        if (string.IsNullOrWhiteSpace(trimmedText) && finalImageCount == 0)
        {
            return BadRequest(new { message = "Post cannot be empty." });
        }

        if (trimmedText?.Length > 2000)
        {
            return BadRequest(new { message = "Text too long (max 2000)." });
        }

        post.Text = string.IsNullOrWhiteSpace(trimmedText) ? null : trimmedText;
        post.Type = finalImageCount > 0 ? PostType.Image : PostType.Text;

        foreach (var image in imagesToRemove)
        {
            _imageService.DeleteImage(image.Url);
        }

        _db.ImagePosts.RemoveRange(imagesToRemove);

        for (var i = 0; i < remainingImages.Count; i++)
        {
            remainingImages[i].Position = i;
        }

        try
        {
            for (var i = 0; i < newImages.Count; i++)
            {
                var imageUrl = await _imageService.SaveImageAsync(newImages[i], "posts");

                var imagePost = new ImagePost
                {
                    PostId = post.Id,
                    Url = imageUrl,
                    Position = remainingImages.Count + i
                };

                _db.ImagePosts.Add(imagePost);
            }
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch
        {
            return BadRequest(new { message = "Invalid image file." });
        }

        await _db.SaveChangesAsync();

        var currentUserId = userId;

        var updatedPost = await _db.Posts
            .Where(p => p.Id == id)
            .Select(p => new PostDto
            {
                Id = p.Id,
                Title = p.Title,
                Text = p.Text,
                Type = p.Type.ToString(),
                CreatedAt = p.CreatedAt,
                LikesCount = p.Likes.Count,
                CommentsCount = p.Comments.Count,

                IsLiked = p.Likes.Any(u => u.Id == currentUserId),
                IsSaved = p.SavedBy.Any(u => u.Id == currentUserId),

                Images = p.ImagePosts
                    .OrderBy(i => i.Position)
                    .Select(i => i.Url)
                    .ToList(),

                Author = new AuthorDto
                {
                    Id = p.Author.Id,
                    UserName = p.Author.UserName!,
                    Avatar = p.Author.Avatar,
                    IsElderOwl = p.Author.IsElderOwl
                },

                Community = p.Community != null ? new CommunitySummaryDto
                {
                    Id = p.Community.Id,
                    Name = p.Community.Name,
                    Image = p.Community.Image
                } : null
            })
            .FirstAsync();

        return Ok(updatedPost);
    }


}