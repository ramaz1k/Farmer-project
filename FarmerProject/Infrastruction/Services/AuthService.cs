using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Domain.Enums;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        if (dto.Role == UserRole.Admin)
            throw new InvalidOperationException("Нельзя зарегистрироваться как админ.");

        var exists = await _db.Users.AnyAsync(u => u.Email == dto.Email);
        if (exists)
            throw new InvalidOperationException("Пользователь с такой почтой уже есть.");

        var user = new User
        {
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = dto.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = _tokenService.CreateToken(user),
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }
public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
{
    var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

    if (user is null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        throw new UnauthorizedAccessException("Неверная почта или пароль.");

    return new AuthResponseDto
    {
        Token = _tokenService.CreateToken(user),
        Email = user.Email,
        Role = user.Role.ToString()
    };
}
}