using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server;
using server.Models;
using server.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddAntiforgery();
builder.Services.AddSignalR();

builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<ChannelService>();

builder.Services.AddDbContext<AppDbContext>(opts =>
{
    opts.UseNpgsql(builder.Configuration.GetConnectionString("Default"));
});
builder.Services.AddIdentityCore<ApplicationUser>(opts =>
{
    opts.User.RequireUniqueEmail = true;
    opts.Password.RequiredLength = 6;
    opts.Password.RequireDigit = true;
    opts.Password.RequireLowercase = true;
    opts.Password.RequireUppercase = true;
    opts.Password.RequireNonAlphanumeric = false;
}).AddEntityFrameworkStores<AppDbContext>().AddSignInManager();
builder.Services.AddAuthentication(IdentityConstants.ApplicationScheme).AddIdentityCookies();
builder.Services.AddAuthorization();
builder.Services.AddAntiforgery(opts =>
{
    opts.HeaderName = "X-CSRF-TOKEN";
});
builder.Services.AddCors(opts =>
{
    opts.AddPolicy("client", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://twilight.bolkodev.ipv64.de", "http://192.168.1.50:5173").AllowCredentials().AllowAnyHeader().AllowAnyMethod();
    });
});

var app = builder.Build();
app.MapHub<NotificationHub>("/Hubs/NotificationHub");
app.MapHub<ChatHub>("/Hubs/ChatHub");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}
app.UseCors("client");
app.UseStaticFiles();
app.UseAntiforgery();
app.UseAuthorization();
app.MapControllers();

app.Run();
