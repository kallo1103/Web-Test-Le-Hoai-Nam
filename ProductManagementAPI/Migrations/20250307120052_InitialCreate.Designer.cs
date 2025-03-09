﻿// <auto-generated />
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using ProductManagementAPI.Data;

#nullable disable

namespace ProductManagementAPI.Migrations
{
    [DbContext(typeof(ProductDbContext))]
    [Migration("20250307120052_InitialCreate")]
    partial class InitialCreate
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "9.0.2")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("ProductManagementAPI.Models.Product", b =>
                {
                    b.Property<string>("ProductId")
                        .HasMaxLength(9)
                        .HasColumnType("nvarchar(9)")
                        .HasColumnName("ma_hanghoa");

                    b.Property<string>("Notes")
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ghi_chu");

                    b.Property<string>("ProductName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("ten_hanghoa");

                    b.Property<int>("Quantity")
                        .HasColumnType("int")
                        .HasColumnName("so_luong");

                    b.HasKey("ProductId");

                    b.ToTable("hang_hoa");
                });
#pragma warning restore 612, 618
        }
    }
}
