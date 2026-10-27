using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class ReviewService : IReviewService
{
    private readonly AppDbContext _db;

    public ReviewService(AppDbContext db)
    {
        _db = db;
    }

    private static ReviewDto ToDto(Review r) => new()
    {
        Id = r.Id,
        Rating = r.Rating,
        Text = r.Text,
        CreatedAt = r.CreatedAt,
        FarmerProfileId = r.FarmerProfileId
    };

    public async Task<ReviewDto> CreateAsync(int buyerId, CreateReviewDto dto)
    {
        var order = await _db.Orders
            .FirstOrDefaultAsync(o => o.Id == dto.OrderId && o.BuyerId == buyerId);
        if (order is null)
            throw new InvalidOperationException("Заказ не найден.");

        if (order.Status != OrderStatus.Completed)
            throw new InvalidOperationException("Отзыв можно оставить только после выдачи заказа.");

        var exists = await _db.Reviews.AnyAsync(r => r.OrderId == order.Id);
        if (exists)
            throw new InvalidOperationException("Отзыв на этот заказ уже есть.");

        var review = new Review
        {
            OrderId = order.Id,
            BuyerId = buyerId,
            FarmerProfileId = order.FarmerProfileId,
            Rating = dto.Rating,
            Text = dto.Text
        };

        _db.Reviews.Add(review);
        await _db.SaveChangesAsync();

        return ToDto(review);
    }

    public async Task<List<ReviewDto>> GetByFarmerAsync(int farmerProfileId)
    {
        var reviews = await _db.Reviews
            .AsNoTracking()
            .Where(r => r.FarmerProfileId == farmerProfileId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();
        return reviews.Select(ToDto).ToList();
    }
}