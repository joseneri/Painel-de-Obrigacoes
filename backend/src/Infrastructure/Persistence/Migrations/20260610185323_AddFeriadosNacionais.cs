using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PainelObrigacoes.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddFeriadosNacionais : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "FeriadosNacionais",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Data = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Nome = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Fonte = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    SincronizadoEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeriadosNacionais", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_FeriadosNacionais_Data",
                table: "FeriadosNacionais",
                column: "Data",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "FeriadosNacionais");
        }
    }
}
