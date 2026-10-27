namespace Application.DTOs;

public class ReviewDto
{
    public int Id { get; set; }
    public int Rating { get; set; }
    public string? Text { get; set; }
    public DateTime CreatedAt { get; set; }
    public int FarmerProfileId { get; set; }
}