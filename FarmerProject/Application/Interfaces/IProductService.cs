using Application.DTOs;

namespace Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(ProductQueryDto query); Task<ProductDto?> GetByIdAsync(int id);
    Task<ProductDto> CreateAsync(int userId, CreateProductDto dto);
    Task<ProductDto?> UpdateAsync(int userId, int id, CreateProductDto dto);
    Task<bool> DeleteAsync(int userId, int id);
    Task<ProductDto?> SetImageAsync(int userId, int id, string imageUrl);
}