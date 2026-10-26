using Application.DTOs;

namespace Application.Interfaces;

public interface IProductService
{
    Task<List<ProductDto>> GetAllAsync();
    Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(int userId, CreateProductDto dto);
    Task<ProductDto?> UpdateAsync(int userId, int id, CreateProductDto dto);
    Task<bool> DeleteAsync(int userId, int id);
}