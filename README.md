# FarmMarket API

Бэкенд маркетплейса, где фермеры продают свои продукты напрямую покупателям, без перекупов.

## Стек

C#, ASP.NET Core Web API (.NET 10), Entity Framework Core, PostgreSQL, JWT-авторизация.

## Архитектура

Clean Architecture, четыре проекта:

- **Domain**: сущности и enum'ы, без зависимостей.
- **Application**: DTO и интерфейсы сервисов.
- **Infrastruction**: EF Core, миграции, реализации сервисов, JWT и хеширование паролей.
- **Api**: контроллеры и настройка приложения.

## Возможности

- Регистрация и вход (JWT), роли: покупатель (Buyer) и фермер (Farmer).
- Профили фермеров.
- Каталог товаров с фильтрами (категория, регион, поиск по названию, диапазон цен) и пагинацией.
- Заказы: один заказ на одного фермера, остаток списывается атомарно в транзакции, при отмене возвращается.
- Статусы заказа: New, Confirmed, Completed, Cancelled.
- Отзывы: только после выдачи заказа, один отзыв на заказ (уникальный индекс в БД).
- Проверка владельца: фермер меняет только свои товары и заказы.

## Эндпоинты

| Метод | Путь | Доступ |
|---|---|---|
| POST | /auth/register, /auth/login | все |
| GET | /auth/me | авторизованные |
| POST | /farmers | Farmer |
| GET | /farmers/me | Farmer |
| GET | /farmers/{id} | все |
| GET | /products?categoryId&region&search&minPrice&maxPrice&page&pageSize | все |
| GET | /products/{id} | все |
| POST, PUT, DELETE | /products | Farmer (свои) |
| POST | /orders | Buyer |
| GET | /orders/my | Buyer |
| GET | /orders/incoming | Farmer |
| PATCH | /orders/{id}/status | Farmer |
| POST | /orders/{id}/cancel | Buyer |
| POST | /reviews | Buyer |
| GET | /reviews/farmer/{id} | все |

## Запуск локально

Нужны .NET 10 SDK, PostgreSQL и утилита `dotnet-ef`.

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=farmmarket;Username=postgres;Password=ТВОЙ_ПАРОЛЬ" --project FarmerProject/Api
dotnet user-secrets set "Jwt:Key" "любая-случайная-строка-от-32-символов" --project FarmerProject/Api
dotnet ef database update --project FarmerProject/Infrastruction --startup-project FarmerProject/Api
dotnet run --project FarmerProject/Api
```

## Планы

Общая обработка ошибок, фронтенд, деплой.