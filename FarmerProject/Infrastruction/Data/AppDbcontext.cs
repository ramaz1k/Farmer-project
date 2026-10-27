using Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Infrastruction.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<FarmerProfile> FarmerProfiles => Set<FarmerProfile>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<Review> Reviews => Set<Review>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Category>().HasData(
        new Category { Id = 1, Name = "Фрукты" },
        new Category { Id = 2, Name = "Овощи" },
        new Category { Id = 3, Name = "Орехи и сухофрукты" },
        new Category { Id = 4, Name = "Мёд" },
        new Category { Id = 5, Name = "Мясо" },
        new Category { Id = 6, Name = "Молочные продукты" }
    );
modelBuilder.Entity<Review>().HasIndex(r => r.OrderId).IsUnique();
}

}