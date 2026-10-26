using System.Linq.Expressions;
using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class ProductService : IProductService
{
    private readonly AppDbContext _db;

    public ProductService(AppDbContext db)
    {
        _db = db;
    }

    private static readonly Expression<Func<Product, ProductDto>> ToDto = p => new ProductDto
    {
        Id = p.Id,
        Title = p.Title,
        Description = p.Description,
        Price = p.Price,
        Unit = p.Unit,
        Stock = p.Stock,
        IsPreorder = p.IsPreorder,
        HarvestDate = p.HarvestDate,
        CategoryId = p.CategoryId,
        CategoryName = p.Category.Name,
        FarmerProfileId = p.FarmerProfileId,
        FarmerName = p.FarmerProfile.Name,
        FarmerRegion = p.FarmerProfile.Region
    };

    public async Task<List<ProductDto>> GetAllAsync()
    {
        return await _db.Products.Select(ToDto).ToListAsync();
    }

    public async Task<ProductDto?> GetByIdAsync(int id)
    {
        return await _db.Products
            .Where(p => p.Id == id)
            .Select(ToDto)
            .FirstOrDefaultAsync();
    }

    public async Task<ProductDto> CreateAsync(int userId, CreateProductDto dto)
{
    var farmer = await _db.FarmerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
    if (farmer is null)
        throw new InvalidOperationException("Сначала создайте профиль фермера.");

    var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
        throw new InvalidOperationException("Такой категории нет.");

    var product = new Product
    {
        Title = dto.Title,
        Description = dto.Description,
        Price = dto.Price,
        Unit = dto.Unit,
        Stock = dto.Stock,
        IsPreorder = dto.IsPreorder,
        HarvestDate = dto.HarvestDate is null
            ? null
            : DateTime.SpecifyKind(dto.HarvestDate.Value, DateTimeKind.Utc),
        CategoryId = dto.CategoryId,
        FarmerProfileId = farmer.Id
    };

    _db.Products.Add(product);
    await _db.SaveChangesAsync();

    return (await GetByIdAsync(product.Id))!;
}
    public async Task<ProductDto?> UpdateAsync(int userId, int id, CreateProductDto dto)
{
    var product = await _db.Products
        .FirstOrDefaultAsync(p => p.Id == id && p.FarmerProfile.UserId == userId);
    if (product is null)
        return null;

    var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
    if (!categoryExists)
        throw new InvalidOperationException("Такой категории нет.");

    product.Title = dto.Title;
    product.Description = dto.Description;
    product.Price = dto.Price;
    product.Unit = dto.Unit;
    product.Stock = dto.Stock;
    product.IsPreorder = dto.IsPreorder;
    product.HarvestDate = dto.HarvestDate is null
        ? null
        : DateTime.SpecifyKind(dto.HarvestDate.Value, DateTimeKind.Utc);
    product.CategoryId = dto.CategoryId;

    await _db.SaveChangesAsync();

    return await GetByIdAsync(product.Id);
}

public async Task<bool> DeleteAsync(int userId, int id)
{
    var product = await _db.Products
        .FirstOrDefaultAsync(p => p.Id == id && p.FarmerProfile.UserId == userId);
    if (product is null)
        return false;

    _db.Products.Remove(product);
    await _db.SaveChangesAsync();

    return true;
}
}