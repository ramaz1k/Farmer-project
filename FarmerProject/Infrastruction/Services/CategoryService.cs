using Application.DTOs;
using Application.Interfaces;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class CategoryService : ICategoryService
{
    private readonly AppDbContext _db;

    public CategoryService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<List<CategoryDto>> GetAllAsync() =>
        await _db.Categories.AsNoTracking()
            .OrderBy(c => c.Id)
            .Select(c => new CategoryDto { Id = c.Id, Name = c.Name })
            .ToListAsync();
}
