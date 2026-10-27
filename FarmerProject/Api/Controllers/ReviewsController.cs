using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("reviews")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [Authorize(Roles = "Buyer")]
    [HttpPost]
    public async Task<ActionResult<ReviewDto>> Create(CreateReviewDto dto)
    {
        try
        {
            return Ok(await _reviewService.CreateAsync(GetUserId(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("farmer/{farmerProfileId:int}")]
    public async Task<ActionResult<List<ReviewDto>>> GetByFarmer(int farmerProfileId)
    {
        return Ok(await _reviewService.GetByFarmerAsync(farmerProfileId));
    }
}