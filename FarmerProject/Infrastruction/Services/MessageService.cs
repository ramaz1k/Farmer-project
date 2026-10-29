using Application.DTOs;
using Application.Interfaces;
using Domain.Entities;
using Infrastruction.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Services;

public class MessageService : IMessageService
{
    private readonly AppDbContext _db;

    public MessageService(AppDbContext db)
    {
        _db = db;
    }

    private static MessageDto ToDto(Message m, int userId, string? productTitle) => new()
    {
        Id = m.Id,
        SenderId = m.SenderId,
        ReceiverId = m.ReceiverId,
        ProductId = m.ProductId,
        ProductTitle = productTitle,
        Text = m.Text,
        CreatedAt = m.CreatedAt,
        FromMe = m.SenderId == userId
    };

    public async Task<MessageDto> SendAsync(int senderId, SendMessageDto dto)
    {
        var text = dto.Text.Trim();
        if (text.Length == 0)
            throw new InvalidOperationException("Сообщение пустое.");
        if (text.Length > 2000)
            throw new InvalidOperationException("Сообщение слишком длинное (макс. 2000 символов).");
        if (dto.PeerUserId == senderId)
            throw new InvalidOperationException("Нельзя написать самому себе.");

        var peerExists = await _db.Users.AnyAsync(u => u.Id == dto.PeerUserId);
        if (!peerExists)
            throw new InvalidOperationException("Получатель не найден.");

        if (dto.ProductId is not null &&
            !await _db.Products.AnyAsync(p => p.Id == dto.ProductId.Value))
            throw new InvalidOperationException("Товар не найден.");

        var message = new Message
        {
            SenderId = senderId,
            ReceiverId = dto.PeerUserId,
            ProductId = dto.ProductId,
            Text = text
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        var productTitle = message.ProductId is null
            ? null
            : await _db.Products.AsNoTracking()
                .Where(p => p.Id == message.ProductId)
                .Select(p => p.Title)
                .FirstOrDefaultAsync();

        return ToDto(message, senderId, productTitle);
    }

    public async Task<List<MessageDto>> GetThreadAsync(int userId, int peerUserId, int? productId)
    {
        var query = _db.Messages.AsNoTracking().Where(m =>
            (m.SenderId == userId && m.ReceiverId == peerUserId) ||
            (m.SenderId == peerUserId && m.ReceiverId == userId));

        if (productId is not null)
            query = query.Where(m => m.ProductId == productId);

        var list = await query
            .OrderBy(m => m.CreatedAt)
            .ThenBy(m => m.Id)
            .ToListAsync();

        var productTitles = await _db.Products.AsNoTracking()
            .Where(p => list.Select(m => m.ProductId).Contains(p.Id))
            .Select(p => new { p.Id, p.Title })
            .ToDictionaryAsync(p => p.Id, p => p.Title);

        // входящие сообщения этого диалога помечаем прочитанными
        var incoming = list.Where(m => m.ReceiverId == userId && m.ReadAt == null).ToList();
        if (incoming.Count > 0)
        {
            var ids = incoming.Select(m => m.Id).ToList();
            await _db.Messages
                .Where(m => ids.Contains(m.Id))
                .ExecuteUpdateAsync(s => s.SetProperty(m => m.ReadAt, DateTime.UtcNow));
        }

        return list.Select(m => ToDto(
            m,
            userId,
            m.ProductId is not null && productTitles.TryGetValue(m.ProductId.Value, out var title)
                ? title
                : null)).ToList();
    }

    public async Task<List<ConversationDto>> GetConversationsAsync(int userId)
    {
        var messages = await _db.Messages.AsNoTracking()
            .Where(m => m.SenderId == userId || m.ReceiverId == userId)
            .OrderByDescending(m => m.CreatedAt)
            .ThenByDescending(m => m.Id)
            .ToListAsync();

        var grouped = messages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g =>
            {
                var last = g.First();
                return new
                {
                    PeerUserId = g.Key,
                    LastText = last.Text,
                    LastAt = last.CreatedAt,
                    UnreadCount = g.Count(m => m.ReceiverId == userId && m.ReadAt == null),
                    ProductId = last.ProductId
                };
            })
            .OrderByDescending(c => c.LastAt)
            .ToList();

        if (grouped.Count == 0)
            return new List<ConversationDto>();

        var peerIds = grouped.Select(c => c.PeerUserId).Distinct().ToList();
        var peers = await _db.Users.AsNoTracking()
            .Where(u => peerIds.Contains(u.Id))
            .Select(u => new
            {
                u.Id,
                u.Email,
                ProfileName = _db.FarmerProfiles
                    .Where(f => f.UserId == u.Id)
                    .Select(f => f.Name)
                    .FirstOrDefault()
            })
            .ToDictionaryAsync(u => u.Id);

        var productIds = grouped
            .Where(c => c.ProductId is not null)
            .Select(c => c.ProductId!.Value)
            .Distinct()
            .ToList();
        var productTitles = await _db.Products.AsNoTracking()
            .Where(p => productIds.Contains(p.Id))
            .Select(p => new { p.Id, p.Title })
            .ToDictionaryAsync(p => p.Id, p => p.Title);

        return grouped.Select(c => new ConversationDto
        {
            PeerUserId = c.PeerUserId,
            PeerName = peers.TryGetValue(c.PeerUserId, out var p)
                ? p.ProfileName ?? p.Email
                : "#",
            ProductId = c.ProductId,
            ProductTitle = c.ProductId is not null && productTitles.TryGetValue(c.ProductId.Value, out var title)
                ? title
                : null,
            LastText = c.LastText,
            LastAt = c.LastAt,
            UnreadCount = c.UnreadCount
        }).ToList();
    }

    public async Task<int> UnreadCountAsync(int userId) =>
        await _db.Messages.CountAsync(m => m.ReceiverId == userId && m.ReadAt == null);
}
