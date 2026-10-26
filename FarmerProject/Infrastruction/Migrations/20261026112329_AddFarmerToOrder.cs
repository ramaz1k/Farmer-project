using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastruction.Migrations
{
    /// <inheritdoc />
    public partial class AddFarmerToOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FarmerProfileId",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_FarmerProfileId",
                table: "Orders",
                column: "FarmerProfileId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_FarmerProfiles_FarmerProfileId",
                table: "Orders",
                column: "FarmerProfileId",
                principalTable: "FarmerProfiles",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_FarmerProfiles_FarmerProfileId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_FarmerProfileId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "FarmerProfileId",
                table: "Orders");
        }
    }
}
