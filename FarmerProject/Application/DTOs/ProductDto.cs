namespace Application.DTOs;

public class ProductDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = string.Empty;
    public decimal Stock { get; set; }
    public bool IsPreorder { get; set; }
    public DateTime? HarvestDate { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int FarmerProfileId { get; set; }
    public string FarmerName { get; set; } = string.Empty;
    public string FarmerRegion { get; set; } = string.Empty;
}