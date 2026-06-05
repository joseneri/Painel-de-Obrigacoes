using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace PainelObrigacoes.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Empresas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RazaoSocial = table.Column<string>(type: "character varying(180)", maxLength: 180, nullable: false),
                    CNPJ = table.Column<string>(type: "character varying(14)", maxLength: 14, nullable: false),
                    RegimeTributario = table.Column<int>(type: "integer", nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Empresas", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Obrigacoes",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EmpresaId = table.Column<Guid>(type: "uuid", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    CompetenciaAno = table.Column<int>(type: "integer", nullable: false),
                    CompetenciaMes = table.Column<int>(type: "integer", nullable: false),
                    DataVencimento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    Periodicidade = table.Column<int>(type: "integer", nullable: false),
                    CriadaEm = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Obrigacoes", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Obrigacoes_Empresas_EmpresaId",
                        column: x => x.EmpresaId,
                        principalTable: "Empresas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Entregas",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ObrigacaoId = table.Column<Guid>(type: "uuid", nullable: false),
                    DataConclusao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Observacao = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Entregas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Entregas_Obrigacoes_ObrigacaoId",
                        column: x => x.ObrigacaoId,
                        principalTable: "Obrigacoes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Empresas_CNPJ",
                table: "Empresas",
                column: "CNPJ",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Entregas_ObrigacaoId",
                table: "Entregas",
                column: "ObrigacaoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Obrigacoes_DataVencimento",
                table: "Obrigacoes",
                column: "DataVencimento");

            migrationBuilder.CreateIndex(
                name: "IX_Obrigacoes_EmpresaId_Tipo_CompetenciaAno_CompetenciaMes",
                table: "Obrigacoes",
                columns: new[] { "EmpresaId", "Tipo", "CompetenciaAno", "CompetenciaMes" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Entregas");

            migrationBuilder.DropTable(
                name: "Obrigacoes");

            migrationBuilder.DropTable(
                name: "Empresas");
        }
    }
}
