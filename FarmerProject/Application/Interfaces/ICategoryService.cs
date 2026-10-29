using Application.DTOs;

namespace Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryDto>> GetAllAsync();
}
