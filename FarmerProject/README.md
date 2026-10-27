# FarmMarket API

Backend API for a marketplace where farmers sell their products directly to buyers, without middlemen.

## Stack

C#, ASP.NET Core Web API (.NET 10), Entity Framework Core, PostgreSQL, JWT authentication.

## Architecture

Clean Architecture, four projects:

- **Domain**: entities and enums, no dependencies.
- **Application**: DTOs and service interfaces.
- **Infrastruction**: EF Core, migrations, service implementations, JWT and password hashing.
- **Api**: controllers and app configuration.

## Features

- Registration and login (JWT), roles: Buyer, Farmer.
- Farmer profiles.
- Product catalog with filters (category, region, search, price range) and pagination.
- Orders: one order per farmer, stock is decreased atomically in a transaction, cancel returns stock.
- Order status flow: New, Confirmed, Completed, Cancelled.
- Reviews: only for completed orders, one review per order (unique index).
- Ownership checks: a farmer can only change their own products and orders.

## Endpoints

| Method | Path | Access |
|---|---|---|
| POST | /auth/register, /auth/login | all |
| GET | /auth/me | authorized |
| POST | /farmers | Farmer |
| GET | /farmers/me | Farmer |
| GET | /farmers/{id} | all |
| GET | /products?categoryId&region&search&minPrice&maxPrice&page&pageSize | all |
| GET | /products/{id} | all |
| POST, PUT, DELETE | /products | Farmer (own) |
| POST | /orders | Buyer |
| GET | /orders/my | Buyer |
| GET | /orders/incoming | Farmer |
| PATCH | /orders/{id}/status | Farmer |
| POST | /orders/{id}/cancel | Buyer |
| POST | /reviews | Buyer |
| GET | /reviews/farmer/{id} | all |

## Run locally

Requires the .NET 10 SDK, PostgreSQL and the `dotnet-ef` tool.

```powershell
dotnet user-secrets set "ConnectionStrings:DefaultConnection" "Host=localhost;Port=5432;Database=farmmarket;Username=postgres;Password=YOUR_PASSWORD" --project FarmerProject/Api
dotnet user-secrets set "Jwt:Key" "any-random-string-of-at-least-32-characters" --project FarmerProject/Api
dotnet ef database update --project FarmerProject/Infrastruction --startup-project FarmerProject/Api
dotnet run --project FarmerProject/Api
```

## Roadmap

Global error handling, frontend, deployment.

Английский выбрал, потому что работодатели чаще смотрят README на нём. Если нужен русский, скажи, переведу.