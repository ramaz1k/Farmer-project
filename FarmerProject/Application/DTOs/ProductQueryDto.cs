using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class ProductQueryDto
{
    public int? CategoryId { get; set; }
    public string? Region { get; set; }
    public string? Search { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public int? FarmerProfileId { get; set; }

    // price_asc | price_desc | newest | пусто — исходный порядок по id
    public string? Sort { get; set; }

    [Range(1, int.MaxValue)]
    public int Page { get; set; } = 1;

    [Range(1, 50)]
    public int PageSize { get; set; } = 10;
}