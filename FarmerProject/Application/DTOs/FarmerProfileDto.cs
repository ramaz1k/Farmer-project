namespace Application.DTOs;

public class FarmerProfileDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Description { get; set; }
}