using Domain.Enums;

namespace Domain.Entities;

public class Order
{
    public int Id { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.New;
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public int BuyerId { get; set; }
    public User Buyer { get; set; } = null!;

    public int FarmerProfileId { get; set; }
    public FarmerProfile FarmerProfile { get; set; } = null!;

    public List<OrderItem> Items { get; set; } = new();
}