using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("farmers")]
public class FarmersController : ControllerBase
{
    private readonly IFarmerService _farmerService;

    public FarmersController(IFarmerService farmerService)
    {
        _farmerService = farmerService;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [Authorize(Roles = "Farmer")]
    [HttpPost]
    public async Task<ActionResult<FarmerProfileDto>> Create(CreateFarmerProfileDto dto)
    {
        try
        {
            return Ok(await _farmerService.CreateProfileAsync(GetUserId(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [Authorize(Roles = "Farmer")]
    [HttpGet("me")]
    public async Task<ActionResult<FarmerProfileDto>> GetMine()
    {
        var profile = await _farmerService.GetMyProfileAsync(GetUserId());
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FarmerProfileDto>> GetById(int id)
    {
        var profile = await _farmerService.GetByIdAsync(id);
        return profile is null ? NotFound() : Ok(profile);
    }
}