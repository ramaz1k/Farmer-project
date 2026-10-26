using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateFarmerProfileDto
{
    [Required, MaxLength(200)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Region { get; set; } = string.Empty;

    [Required, Phone, MaxLength(30)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(2000)]
    public string? Description { get; set; }
}