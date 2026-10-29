namespace Application.DTOs;

public class ConversationDto
{
    public int PeerUserId { get; set; }
    public string PeerName { get; set; } = string.Empty;
    public int? ProductId { get; set; }
    public string? ProductTitle { get; set; }
    public string LastText { get; set; } = string.Empty;
    public DateTime LastAt { get; set; }
    public int UnreadCount { get; set; }
}
