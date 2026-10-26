using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("orders")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderDto dto)
    {
        try
        {
            return Ok(await _orderService.CreateAsync(GetUserId(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Buyer")]
    [HttpGet("my")]
    public async Task<ActionResult<List<OrderDto>>> GetMine()
    {
        return Ok(await _orderService.GetMyOrdersAsync(GetUserId()));
    }

    [Authorize(Roles = "Farmer")]
    [HttpGet("incoming")]
    public async Task<ActionResult<List<OrderDto>>> GetIncoming()
    {
        return Ok(await _orderService.GetIncomingAsync(GetUserId()));
    }

    [Authorize(Roles = "Farmer")]
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(int id, UpdateOrderStatusDto dto)
    {
        try
        {
            var order = await _orderService.UpdateStatusAsync(GetUserId(), id, dto.Status);
            return order is null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Buyer")]
    [HttpPost("{id:int}/cancel")]
    public async Task<ActionResult<OrderDto>> Cancel(int id)
    {
        try
        {
            var order = await _orderService.CancelAsync(GetUserId(), id);
            return order is null ? NotFound() : Ok(order);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }
}