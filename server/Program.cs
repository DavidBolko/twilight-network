using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using server;
using server.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddScoped<ImageService>();
builder.Services.AddScoped<ChannelService>();

builder.Logging.AddConsole().SetMinimumLevel(LogLevel.Debug);

builder.Services.AddDbContext<AppDbContext>(opts =>
{
    opts.UseNpgsql(
        builder.Configuration.GetConnectionString("Default")
    );
});

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        const string keycloakAuthority =
            "https://authservice.bolkodev.ipv64.de/realms/twilight";

        options.Authority = keycloakAuthority;
        options.RequireHttpsMetadata = true;

        options.MapInboundClaims = false;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = keycloakAuthority,

            ValidateAudience = false,

            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(2),

            NameClaimType = "name",
            RoleClaimType = "roles"
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = "X-CSRF-TOKEN";
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("client", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://twilight.bolkodev.ipv64.de",
                "http://192.168.1.50:5173"
            )
            .AllowCredentials()
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("client");

app.UseStaticFiles();

app.UseAuthentication();
app.UseAuthorization();

app.UseAntiforgery();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.MapControllers();

app.Run();