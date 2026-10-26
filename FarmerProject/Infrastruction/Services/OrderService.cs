using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class OrderService : IOrderService
{
    private readonly AppDbContext _db;

    public OrderService(AppDbContext db)
    {
        _db = db;
    }

    private IQueryable<Order> Query() => _db.Orders
        .AsNoTracking()
        .Include(o => o.Buyer)
        .Include(o => o.FarmerProfile)
        .Include(o => o.Items).ThenInclude(i => i.Product);

    private static OrderDto ToDto(Order o) => new()
    {
        Id = o.Id,
        Status = o.Status.ToString(),
        TotalPrice = o.TotalPrice,
        CreatedAt = o.CreatedAt,
        BuyerId = o.BuyerId,
        BuyerEmail = o.Buyer.Email,
        FarmerProfileId = o.FarmerProfileId,
        FarmerName = o.FarmerProfile.Name,
        Items = o.Items.Select(i => new OrderItemDto
        {
            ProductId = i.ProductId,
            ProductTitle = i.Product.Title,
            Unit = i.Product.Unit,
            Quantity = i.Quantity,
            PriceAtOrder = i.PriceAtOrder
        }).ToList()
    };

    private async Task<OrderDto?> GetOrderAsync(int id)
    {
        var order = await Query().FirstOrDefaultAsync(o => o.Id == id);
        return order is null ? null : ToDto(order);
    }

    public async Task<List<OrderDto>> GetMyOrdersAsync(int buyerId)
    {
        var orders = await Query()
            .Where(o => o.BuyerId == buyerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return orders.Select(ToDto).ToList();
    }

    public async Task<List<OrderDto>> GetIncomingAsync(int userId)
    {
        var orders = await Query()
            .Where(o => o.FarmerProfile.UserId == userId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();
        return orders.Select(ToDto).ToList();
    }

   public async Task<OrderDto> CreateAsync(int buyerId, CreateOrderDto dto)
{
    var items = dto.Items
        .GroupBy(i => i.ProductId)
        .Select(g => new { ProductId = g.Key, Quantity = g.Sum(x => x.Quantity) })
        .ToList();

    await using var tx = await _db.Database.BeginTransactionAsync();

    var ids = items.Select(i => i.ProductId).ToList();
    var products = await _db.Products
        .AsNoTracking()
        .Where(p => ids.Contains(p.Id))
        .ToListAsync();

    if (products.Count != ids.Count)
        throw new InvalidOperationException("Какого-то из товаров не существует.");

    if (products.Select(p => p.FarmerProfileId).Distinct().Count() > 1)
        throw new InvalidOperationException("В одном заказе могут быть товары только одного фермера.");

    foreach (var item in items)
    {
        var affected = await _db.Products
            .Where(p => p.Id == item.ProductId && p.Stock >= item.Quantity)
            .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock - item.Quantity));

        if (affected == 0)
            throw new InvalidOperationException("Недостаточно товара в наличии.");
    }

    var order = new Order
    {
        BuyerId = buyerId,
        FarmerProfileId = products[0].FarmerProfileId,
        Items = items.Select(i => new OrderItem
        {
            ProductId = i.ProductId,
            Quantity = i.Quantity,
            PriceAtOrder = products.First(p => p.Id == i.ProductId).Price
        }).ToList()
    };
    order.TotalPrice = order.Items.Sum(i => i.Quantity * i.PriceAtOrder);

    _db.Orders.Add(order);
    await _db.SaveChangesAsync();
    await tx.CommitAsync();

    return (await GetOrderAsync(order.Id))!;
}
private static bool CanTransition(OrderStatus from, OrderStatus to) => (from, to) switch
{
    (OrderStatus.New, OrderStatus.Confirmed) => true,
    (OrderStatus.New, OrderStatus.Cancelled) => true,
    (OrderStatus.Confirmed, OrderStatus.Completed) => true,
    (OrderStatus.Confirmed, OrderStatus.Cancelled) => true,
    _ => false
};

private async Task ApplyStatusAsync(Order order, OrderStatus newStatus)
{
    if (!CanTransition(order.Status, newStatus))
        throw new InvalidOperationException($"Нельзя перевести заказ из {order.Status} в {newStatus}.");

    await using var tx = await _db.Database.BeginTransactionAsync();

    if (newStatus == OrderStatus.Cancelled)
    {
        foreach (var item in order.Items)
        {
            await _db.Products
                .Where(p => p.Id == item.ProductId)
                .ExecuteUpdateAsync(s => s.SetProperty(p => p.Stock, p => p.Stock + item.Quantity));
        }
    }

    order.Status = newStatus;
    await _db.SaveChangesAsync();
    await tx.CommitAsync();
}

public async Task<OrderDto?> UpdateStatusAsync(int userId, int orderId, OrderStatus status)
{
    var order = await _db.Orders
        .Include(o => o.Items)
        .FirstOrDefaultAsync(o => o.Id == orderId && o.FarmerProfile.UserId == userId);
    if (order is null)
        return null;

    await ApplyStatusAsync(order, status);
    return await GetOrderAsync(order.Id);
}

public async Task<OrderDto?> CancelAsync(int buyerId, int orderId)
{
    var order = await _db.Orders
        .Include(o => o.Items)
        .FirstOrDefaultAsync(o => o.Id == orderId && o.BuyerId == buyerId);
    if (order is null)
        return null;

    if (order.Status != OrderStatus.New)
        throw new InvalidOperationException("Отменить можно только новый заказ.");

    await ApplyStatusAsync(order, OrderStatus.Cancelled);
    return await GetOrderAsync(order.Id);
}
}