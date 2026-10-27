using System.ComponentModel.DataAnnotations;

namespace Application.DTOs;

public class CreateReviewDto
{
    [Range(1, int.MaxValue)]
    public int OrderId { get; set; }

    [Range(1, 5)]
    public int Rating { get; set; }

    [MaxLength(1000)]
    public string? Text { get; set; }
}