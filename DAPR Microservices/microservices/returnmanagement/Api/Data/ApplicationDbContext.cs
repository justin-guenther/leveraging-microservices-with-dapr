using Microsoft.EntityFrameworkCore;
using MyMicroservice.Models;

namespace MyMicroservice.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Return> Returns { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Explicitly specify the table name for Returns
            modelBuilder.Entity<Return>(entity =>
            {
                entity.ToTable("returns");
            });
        }
    }
}
