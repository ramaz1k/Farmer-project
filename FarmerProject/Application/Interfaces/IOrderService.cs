using Application.DTOs;
using Domain.Enums;

namespace Application.Interfaces;

public interface IOrderService
{
    Task<OrderDto> CreateAsync(int buyerId, CreateOrderDto dto);
    Task<List<OrderDto>> GetMyOrdersAsync(int buyerId);
    Task<List<OrderDto>> GetIncomingAsync(int userId);
    Task<OrderDto?> UpdateStatusAsync(int userId, int orderId, OrderStatus status);
    Task<OrderDto?> CancelAsync(int buyerId, int orderId);
}