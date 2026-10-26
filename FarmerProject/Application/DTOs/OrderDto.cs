namespace Application.DTOs;

public class OrderItemDto
{
    public int ProductId { get; set; }
    public string ProductTitle { get; set; } = string.Empty;
    public string Unit { get; set; } = string.Empty;
    public decimal Quantity { get; set; }
    public decimal PriceAtOrder { get; set; }
}

public class OrderDto
{
    public int Id { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal TotalPrice { get; set; }
    public DateTime CreatedAt { get; set; }

    public int BuyerId { get; set; }
    public string BuyerEmail { get; set; } = string.Empty;

    public int FarmerProfileId { get; set; }
    public string FarmerName { get; set; } = string.Empty;

    public List<OrderItemDto> Items { get; set; } = new();
}