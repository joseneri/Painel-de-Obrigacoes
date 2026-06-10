using Microsoft.EntityFrameworkCore;
using PainelObrigacoes.Domain.Entities;
using PainelObrigacoes.Domain.Enums;

namespace PainelObrigacoes.Infrastructure.Persistence;

public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Empresa> Empresas => Set<Empresa>();

    public DbSet<Obrigacao> Obrigacoes => Set<Obrigacao>();

    public DbSet<Entrega> Entregas => Set<Entrega>();

    public DbSet<FeriadoNacional> FeriadosNacionais => Set<FeriadoNacional>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        ConfigureEmpresa(modelBuilder);
        ConfigureObrigacao(modelBuilder);
        ConfigureEntrega(modelBuilder);
        ConfigureFeriadoNacional(modelBuilder);
    }

    private static void ConfigureEmpresa(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Empresa>();
        entity.ToTable("Empresas");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.RazaoSocial).HasMaxLength(180).IsRequired();
        entity.Property(e => e.CNPJ).HasMaxLength(14).IsRequired();
        entity.Property(e => e.RegimeTributario).HasConversion<int>().IsRequired();
        entity.Property(e => e.CriadaEm).HasColumnType("timestamp with time zone").IsRequired();
        entity.HasIndex(e => e.CNPJ).IsUnique();
        entity.HasMany(e => e.Obrigacoes)
            .WithOne(o => o.Empresa)
            .HasForeignKey(o => o.EmpresaId)
            .OnDelete(DeleteBehavior.Cascade);
        entity.Navigation(e => e.Obrigacoes).UsePropertyAccessMode(PropertyAccessMode.Field);
    }

    private static void ConfigureObrigacao(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Obrigacao>();
        entity.ToTable("Obrigacoes");
        entity.HasKey(o => o.Id);
        entity.Property(o => o.Tipo).HasConversion<int>().IsRequired();
        entity.Property(o => o.Status).HasConversion<int>().IsRequired();
        entity.Property(o => o.Periodicidade).HasConversion<int>().IsRequired();
        entity.Property(o => o.DataVencimento).HasColumnType("timestamp with time zone").IsRequired();
        entity.Property(o => o.CriadaEm).HasColumnType("timestamp with time zone").IsRequired();
        entity.Ignore(o => o.Competencia);
        entity.Property(o => o.CompetenciaAno).IsRequired();
        entity.Property(o => o.CompetenciaMes).IsRequired();
        entity.HasIndex(o => new { o.EmpresaId, o.Tipo, o.CompetenciaAno, o.CompetenciaMes })
            .IsUnique();
        entity.HasIndex(o => o.DataVencimento);
    }

    private static void ConfigureEntrega(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<Entrega>();
        entity.ToTable("Entregas");
        entity.HasKey(e => e.Id);
        entity.Property(e => e.DataConclusao).HasColumnType("timestamp with time zone").IsRequired();
        entity.Property(e => e.Observacao).HasMaxLength(500);
        entity.HasOne(e => e.Obrigacao)
            .WithOne(o => o.Entrega)
            .HasForeignKey<Entrega>(e => e.ObrigacaoId)
            .OnDelete(DeleteBehavior.Cascade);
        entity.HasIndex(e => e.ObrigacaoId).IsUnique();
    }

    private static void ConfigureFeriadoNacional(ModelBuilder modelBuilder)
    {
        var entity = modelBuilder.Entity<FeriadoNacional>();
        entity.ToTable("FeriadosNacionais");
        entity.HasKey(f => f.Id);
        entity.Property(f => f.Data).HasColumnType("timestamp with time zone").IsRequired();
        entity.Property(f => f.Nome).HasMaxLength(120).IsRequired();
        entity.Property(f => f.Fonte).HasMaxLength(80).IsRequired();
        entity.Property(f => f.SincronizadoEm).HasColumnType("timestamp with time zone").IsRequired();
        entity.HasIndex(f => f.Data).IsUnique();
    }
}
