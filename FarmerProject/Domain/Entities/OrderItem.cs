namespace Domain.Entities;

public class OrderItem
{
    public int Id { get; set; }
    public decimal Quantity { get; set; }
    public decimal PriceAtOrder { get; set; }

    public int OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public int ProductId { get; set; }
    public Product Product { get; set; } = null!;
}