namespace Application.DTOs;

public class SendMessageDto
{
    public int PeerUserId { get; set; }
    public int? ProductId { get; set; }
    public string Text { get; set; } = string.Empty;
}
