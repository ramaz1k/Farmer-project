using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("products")]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IWebHostEnvironment _env;

    public ProductsController(IProductService productService, IWebHostEnvironment env)
    {
        _productService = productService;
        _env = env;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
 [HttpGet]
public async Task<ActionResult<PagedResult<ProductDto>>> GetAll([FromQuery] ProductQueryDto query)
{
    return Ok(await _productService.GetAllAsync(query));
}
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductDto>> GetById(int id)
    {
        var product = await _productService.GetByIdAsync(id);
        return product is null ? NotFound() : Ok(product);
    }

    [Authorize(Roles = "Farmer")]
    [HttpPost]
    public async Task<ActionResult<ProductDto>> Create(CreateProductDto dto)
    {
        try
        {
            var product = await _productService.CreateAsync(GetUserId(), dto);
            return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Farmer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<ProductDto>> Update(int id, CreateProductDto dto)
    {
        try
        {
            var product = await _productService.UpdateAsync(GetUserId(), id, dto);
            return product is null ? NotFound() : Ok(product);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Farmer")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var deleted = await _productService.DeleteAsync(GetUserId(), id);
        return deleted ? NoContent() : NotFound();
    }

    private static readonly string[] AllowedImageTypes =
        ["image/jpeg", "image/png", "image/webp", "image/gif"];

    [Authorize(Roles = "Farmer")]
    [HttpPost("{id:int}/photo")]
    [RequestSizeLimit(6 * 1024 * 1024)]
    public async Task<ActionResult<ProductDto>> UploadPhoto(int id, IFormFile? photo)
    {
        if (photo is null || photo.Length == 0)
            return BadRequest(new { error = "Файл не приложен." });

        if (!AllowedImageTypes.Contains(photo.ContentType))
            return BadRequest(new { error = "Нужно изображение: JPG, PNG, WebP или GIF." });

        if (photo.Length > 5 * 1024 * 1024)
            return BadRequest(new { error = "Максимальный размер фото — 5 МБ." });

        var before = await _productService.GetByIdAsync(id);
        if (before is null)
            return NotFound();

        var uploads = Path.Combine(_env.WebRootPath, "uploads");
        Directory.CreateDirectory(uploads);
        var ext = photo.ContentType switch
        {
            "image/jpeg" => ".jpg",
            "image/png" => ".png",
            "image/webp" => ".webp",
            _ => ".gif"
        };
        var fileName = $"product_{id}_{Guid.NewGuid():N}{ext}";

        await using (var stream = System.IO.File.Create(Path.Combine(uploads, fileName)))
        {
            await photo.CopyToAsync(stream);
        }

        try
        {
            var product = await _productService.SetImageAsync(GetUserId(), id, $"/uploads/{fileName}");
            if (product is null)
            {
                System.IO.File.Delete(Path.Combine(uploads, fileName));
                return NotFound();
            }
        }
        catch
        {
            System.IO.File.Delete(Path.Combine(uploads, fileName));
            throw;
        }

        // старое фото удаляем с диска, чтобы не копились мусором
        if (before.ImageUrl is not null && before.ImageUrl.StartsWith("/uploads/"))
        {
            var oldPath = Path.Combine(uploads, Path.GetFileName(before.ImageUrl));
            if (System.IO.File.Exists(oldPath))
                System.IO.File.Delete(oldPath);
        }

        return Ok(await _productService.GetByIdAsync(id));
    }
}