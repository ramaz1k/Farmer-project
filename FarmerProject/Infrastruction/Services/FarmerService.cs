using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class FarmerService : IFarmerService
{
    private readonly AppDbContext _db;

    public FarmerService(AppDbContext db)
    {
        _db = db;
    }

    private static FarmerProfileDto ToDto(FarmerProfile f) => new()
    {
        Id = f.Id,
        Name = f.Name,
        Region = f.Region,
        Phone = f.Phone,
        Description = f.Description
    };

    public async Task<FarmerProfileDto> CreateProfileAsync(int userId, CreateFarmerProfileDto dto)
    {
        var exists = await _db.FarmerProfiles.AnyAsync(f => f.UserId == userId);
        if (exists)
            throw new InvalidOperationException("Профиль уже создан.");

        var profile = new FarmerProfile
        {
            Name = dto.Name,
            Region = dto.Region,
            Phone = dto.Phone,
            Description = dto.Description,
            UserId = userId
        };

        _db.FarmerProfiles.Add(profile);
        await _db.SaveChangesAsync();

        return ToDto(profile);
    }

    public async Task<FarmerProfileDto?> GetMyProfileAsync(int userId)
    {
        var profile = await _db.FarmerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
        return profile is null ? null : ToDto(profile);
    }

    public async Task<FarmerProfileDto?> UpdateMyProfileAsync(int userId, CreateFarmerProfileDto dto)
    {
        var profile = await _db.FarmerProfiles.FirstOrDefaultAsync(f => f.UserId == userId);
        if (profile is null)
            return null;

        profile.Name = dto.Name;
        profile.Region = dto.Region;
        profile.Phone = dto.Phone;
        profile.Description = dto.Description;

        await _db.SaveChangesAsync();
        return ToDto(profile);
    }

    public async Task<FarmerProfileDto?> GetByIdAsync(int id)
    {
        var profile = await _db.FarmerProfiles.FirstOrDefaultAsync(f => f.Id == id);
        return profile is null ? null : ToDto(profile);
    }
}