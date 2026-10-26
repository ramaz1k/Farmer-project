using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateOrderItemDto
{
    [Range(1, int.MaxValue)]
    public int ProductId { get; set; }

    [Range(0.01, 1000000)]
    public decimal Quantity { get; set; }
}

public class CreateOrderDto
{
    [Required, MinLength(1)]
    public List<CreateOrderItemDto> Items { get; set; } = new();
}