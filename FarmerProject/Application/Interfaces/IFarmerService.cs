using Application.DTOs;

namespace Application.Interfaces;

public interface IFarmerService
{
    Task<FarmerProfileDto> CreateProfileAsync(int userId, CreateFarmerProfileDto dto);
    Task<FarmerProfileDto?> UpdateMyProfileAsync(int userId, CreateFarmerProfileDto dto);
    Task<FarmerProfileDto?> GetMyProfileAsync(int userId);
    Task<FarmerProfileDto?> GetByIdAsync(int id);
}