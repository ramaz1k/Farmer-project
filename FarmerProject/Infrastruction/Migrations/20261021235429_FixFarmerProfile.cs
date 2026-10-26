using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastruction.Migrations
{
    /// <inheritdoc />
    public partial class FixFarmerProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FarmerProfiles_Users_UserID",
                table: "FarmerProfiles");

            migrationBuilder.RenameColumn(
                name: "UserID",
                table: "FarmerProfiles",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_FarmerProfiles_UserID",
                table: "FarmerProfiles",
                newName: "IX_FarmerProfiles_UserId");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "FarmerProfiles",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddForeignKey(
                name: "FK_FarmerProfiles_Users_UserId",
                table: "FarmerProfiles",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FarmerProfiles_Users_UserId",
                table: "FarmerProfiles");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "FarmerProfiles",
                newName: "UserID");

            migrationBuilder.RenameIndex(
                name: "IX_FarmerProfiles_UserId",
                table: "FarmerProfiles",
                newName: "IX_FarmerProfiles_UserID");

            migrationBuilder.AlterColumn<string>(
                name: "Description",
                table: "FarmerProfiles",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_FarmerProfiles_Users_UserID",
                table: "FarmerProfiles",
                column: "UserID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
