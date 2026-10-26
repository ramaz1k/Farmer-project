using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateProductDto
{
    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }

    [Range(0.01, 1000000)]
    public decimal Price { get; set; }

    [Required, MaxLength(20)]
    public string Unit { get; set; } = "кг";

    [Range(0, 1000000)]
    public decimal Stock { get; set; }

    public bool IsPreorder { get; set; }

    public DateTime? HarvestDate { get; set; }

    [Range(1, int.MaxValue)]
    public int CategoryId { get; set; }
}