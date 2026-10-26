namespace Domain.Entities;

public class FarmerProfile
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Region { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int UserId { get; set; }
    public User User { get; set; } = null!;
}