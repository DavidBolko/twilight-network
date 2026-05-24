using System.Security.Claims;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using server.Dto.Auth;
using server.Models;

namespace server.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly IAntiforgery _antiforgery;

    public AuthController(UserManager<ApplicationUser> _userManager, SignInManager<ApplicationUser> _signInManager, IAntiforgery _antiforgery)
    {
        this._userManager = _userManager;
        this._signInManager = _signInManager;
        this._antiforgery = _antiforgery;
    }

    [HttpGet("csrf")]
    public async Task<IActionResult> Csrf()
    {
        var tokens = _antiforgery.GetAndStoreTokens(HttpContext);
        return Ok(new { csrfToken = tokens.RequestToken });
    }


    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto data)
    {
        if (data.Password != data.Password2)
        {
            return BadRequest(new { message = "Passwords do not mach." });
        }
        var email = data.Email.ToLowerInvariant();
        var existingUser = await _userManager.FindByEmailAsync(email);

        if (existingUser is not null)
        {
            return BadRequest(new { message = "User already exists." });
        }
        var user = new ApplicationUser
        {
            UserName = data.UserName.Trim(),
            Email = data.Email,
        };
        var result = await _userManager.CreateAsync(user, data.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { message = result.Errors.FirstOrDefault()?.Description ?? "Registration failed." });
        }
        return CreatedAtAction(nameof(Me), new { id = user.Id }, new
        {
            user.Id,
            user.UserName,
            user.Email
        });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto data)
    {
        var email = data.Email.Trim().ToLowerInvariant();

        var user = await _userManager.FindByEmailAsync(email);

        if (user is null)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        var result = await _signInManager.CheckPasswordSignInAsync(user, data.Password, false);
        await _signInManager.SignInAsync(user, true);
        if (!result.Succeeded)
        {
            return Unauthorized(new { message = "Invalid credentials." });
        }

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Avatar,
            user.About,
            user.IsElderOwl
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userId is null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);

        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            user.Id,
            user.UserName,
            user.Email,
            user.Avatar,
            user.About,
            user.IsElderOwl
        });
    }

    [Authorize]
    [HttpPost("logout")]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();

        return Ok(new { message = "Logged out." });
    }
}