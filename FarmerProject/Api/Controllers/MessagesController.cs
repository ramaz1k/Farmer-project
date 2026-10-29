using System.Security.Claims;
using Application.DTOs;
using Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("messages")]
[Authorize]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _messages;

    public MessagesController(IMessageService messages)
    {
        _messages = messages;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<ActionResult<MessageDto>> Send(SendMessageDto dto)
    {
        try
        {
            return Ok(await _messages.SendAsync(GetUserId(), dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpGet("thread")]
    public async Task<ActionResult<List<MessageDto>>> Thread([FromQuery] int peerUserId, [FromQuery] int? productId)
    {
        return Ok(await _messages.GetThreadAsync(GetUserId(), peerUserId, productId));
    }

    [HttpGet("conversations")]
    public async Task<ActionResult<List<ConversationDto>>> Conversations()
    {
        return Ok(await _messages.GetConversationsAsync(GetUserId()));
    }

    [HttpGet("unread")]
    public async Task<ActionResult<int>> Unread()
    {
        return Ok(await _messages.UnreadCountAsync(GetUserId()));
    }
}
