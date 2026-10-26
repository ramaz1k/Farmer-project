namespace Domain.Entities;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int BuyerId { get; set; }
    public User Buyer { get; set; } = null!;

    public int FarmerProfileId { get; set; }
    public FarmerProfile FarmerProfile { get; set; } = null!;
}