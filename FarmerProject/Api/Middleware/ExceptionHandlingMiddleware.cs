using System.Net;
using System.Text.Json;

namespace Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var (statusCode, message) = exception switch
        {
            InvalidOperationException => (HttpStatusCode.BadRequest, $"Недопустимый запрос: {exception.Message}"),
            KeyNotFoundException => (HttpStatusCode.NotFound, $"Не найдено: {exception.Message}"),
            UnauthorizedAccessException => (HttpStatusCode.Forbidden, "Доступ запрещён"),
            ArgumentException => (HttpStatusCode.BadRequest, $"Некорректные данные: {exception.Message}"),
            _ => (HttpStatusCode.InternalServerError, "Внутренняя ошибка сервера")
        };

        context.Response.StatusCode = (int)statusCode;

        var payload = new
        {
            error = message,
            traceId = context.TraceIdentifier
        };

        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(json);
    }
}
