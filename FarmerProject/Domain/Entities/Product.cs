namespace Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public string Unit { get; set; } = "кг";
    public decimal Stock { get; set; }
    public bool IsPreorder { get; set; }
    public DateTime? HarvestDate { get; set; }

    public int FarmerProfileId { get; set; }
    public FarmerProfile FarmerProfile { get; set; } = null!;

    public int CategoryId { get; set; }
    public Category Category { get; set; } = null!;
}