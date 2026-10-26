using System.ComponentModel.DataAnnotations;
using Domain.Enums;

namespace Application.DTOs;

public class RegisterDto
{
    [Required, EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    public UserRole Role { get; set; }
}