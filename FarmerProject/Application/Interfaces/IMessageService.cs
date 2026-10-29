using Application.DTOs;

namespace Application.Interfaces;

public interface IMessageService
{
    Task<MessageDto> SendAsync(int senderId, SendMessageDto dto);
    Task<List<MessageDto>> GetThreadAsync(int userId, int peerUserId, int? productId);
    Task<List<ConversationDto>> GetConversationsAsync(int userId);
    Task<int> UnreadCountAsync(int userId);
}
