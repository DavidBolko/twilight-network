// Services/ImageService.cs
using ImageMagick;
using Microsoft.AspNetCore.Http;

namespace server.Services;

public class ImageService
{
    private readonly int MAX_SIZE_MB = 8;
    private readonly IWebHostEnvironment _env;

    public ImageService(IWebHostEnvironment env)
    {
        _env = env;
    }

    private string GetUploadFolder(string subfolder)
    {
        var webRootPath = string.IsNullOrWhiteSpace(_env.WebRootPath)
            ? Path.Combine(_env.ContentRootPath, "wwwroot")
            : _env.WebRootPath;

        var folder = Path.Combine(webRootPath, "uploads", subfolder);
        Directory.CreateDirectory(folder);
        return folder;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string subfolder)
    {
        if (file.Length == 0)
            throw new InvalidOperationException("Uploaded image is empty.");

        if (!file.ContentType.StartsWith("image/"))
            throw new InvalidOperationException("Only image files are allowed.");

        if (file.Length > MAX_SIZE_MB * 1024 * 1024)
            throw new InvalidOperationException($"Maximum image size is {MAX_SIZE_MB} MB.");

        var folder = GetUploadFolder(subfolder);
        var fileName = $"{Guid.NewGuid():N}.webp";
        var filePath = Path.Combine(folder, fileName);

        await using var stream = file.OpenReadStream();
        using var image = new MagickImage(stream);

        image.AutoOrient();
        image.Strip();
        image.Format = MagickFormat.WebP;
        image.Quality = 80;

        await image.WriteAsync(filePath);

        return $"/uploads/{subfolder}/{fileName}";
    }

    public void DeleteImage(string imageUrl)
    {
        var parts = imageUrl.TrimStart('/').Split('/');
        if (parts.Length < 3) return;

        var subfolder = string.Join("/", parts[1..^1]);
        var fileName = parts[^1];

        if (string.IsNullOrWhiteSpace(fileName)) return;

        var filePath = Path.Combine(GetUploadFolder(subfolder), fileName);

        if (File.Exists(filePath))
            File.Delete(filePath);
    }

    public void ValidateImages(IList<IFormFile> images, int maxCount = 10, int maxSizeMb = 8)
    {
        if (images.Count > maxCount)
            throw new InvalidOperationException($"Maximum number of images is {maxCount}.");

        foreach (var image in images)
        {
            if (image.Length == 0)
                throw new InvalidOperationException("One of the uploaded images is empty.");

            if (!image.ContentType.StartsWith("image/"))
                throw new InvalidOperationException("Only image files are allowed.");

            if (image.Length > maxSizeMb * 1024 * 1024)
                throw new InvalidOperationException($"Maximum image size is {maxSizeMb} MB.");
        }
    }
}