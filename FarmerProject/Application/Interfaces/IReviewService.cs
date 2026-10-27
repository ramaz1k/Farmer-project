using Application.DTOs;

namespace Application.Interfaces;

public interface IReviewService
{
    Task<ReviewDto> CreateAsync(int buyerId, CreateReviewDto dto);
    Task<List<ReviewDto>> GetByFarmerAsync(int farmerProfileId);
}