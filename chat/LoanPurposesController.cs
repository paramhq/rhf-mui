// =============================================================================
// Domain Entity
// =============================================================================

namespace Domain.Entities;

public class LoanPurpose
{
    public int Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public bool IsSystemDefined { get; private set; }
    public bool IsActive { get; private set; } = true;
    public DateTime CreatedAt { get; private set; }
    public int? CreatedByMemberId { get; private set; }

    private LoanPurpose() { } // EF Core

    public static LoanPurpose CreateSystem(string name, string? description = null)
    {
        return new LoanPurpose
        {
            Name = name.Trim(),
            Description = description,
            IsSystemDefined = true,
            CreatedAt = DateTime.UtcNow
        };
    }

    public static LoanPurpose CreateCustom(string name, int createdByMemberId)
    {
        return new LoanPurpose
        {
            Name = name.Trim(),
            IsSystemDefined = false,
            CreatedByMemberId = createdByMemberId,
            CreatedAt = DateTime.UtcNow
        };
    }
}

// =============================================================================
// DTOs
// =============================================================================

namespace Application.Features.LoanPurposes.DTOs;

public sealed record LoanPurposeOptionDto(
    int Value,
    string Label,
    bool IsSystemDefined
);

public sealed record SearchLoanPurposesQuery(
    string? Search,
    int Limit = 20
);

public sealed record CreateLoanPurposeCommand(
    string Name
);

public sealed record CreateLoanPurposeResult(
    int Value,
    string Label
);

// =============================================================================
// Controller
// =============================================================================

namespace Api.Controllers;

using Application.Features.LoanPurposes.DTOs;
using Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/loan-purposes")]
[Authorize]
public class LoanPurposesController : ControllerBase
{
    private readonly ApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public LoanPurposesController(ApplicationDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    /// <summary>
    /// Search loan purposes for autocomplete
    /// GET /api/loan-purposes?search=agri&limit=20
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<LoanPurposeOptionDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] SearchLoanPurposesQuery query,
        CancellationToken ct)
    {
        var searchTerm = query.Search?.Trim().ToLower() ?? string.Empty;

        var purposes = await _db.LoanPurposes
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Where(p => string.IsNullOrEmpty(searchTerm) || 
                        EF.Functions.ILike(p.Name, $"%{searchTerm}%"))
            .OrderByDescending(p => p.IsSystemDefined) // System-defined first
            .ThenBy(p => p.Name)
            .Take(query.Limit)
            .Select(p => new LoanPurposeOptionDto(
                p.Id,
                p.Name,
                p.IsSystemDefined
            ))
            .ToListAsync(ct);

        return Ok(purposes);
    }

    /// <summary>
    /// Create custom loan purpose (FreeSolo)
    /// POST /api/loan-purposes
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(CreateLoanPurposeResult), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ProblemDetails), StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Create(
        [FromBody] CreateLoanPurposeCommand command,
        CancellationToken ct)
    {
        // Validation
        var name = command.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            return Problem(
                title: "Validation Error",
                detail: "Name is required",
                statusCode: StatusCodes.Status400BadRequest
            );
        }

        if (name.Length > 100)
        {
            return Problem(
                title: "Validation Error",
                detail: "Name must be 100 characters or less",
                statusCode: StatusCodes.Status400BadRequest
            );
        }

        // Check duplicate (case-insensitive)
        var exists = await _db.LoanPurposes
            .AnyAsync(p => p.IsActive && EF.Functions.ILike(p.Name, name), ct);

        if (exists)
        {
            return Problem(
                title: "Duplicate Entry",
                detail: $"Loan purpose '{name}' already exists",
                statusCode: StatusCodes.Status409Conflict
            );
        }

        // Create
        var purpose = LoanPurpose.CreateCustom(name, _currentUser.MemberId);

        _db.LoanPurposes.Add(purpose);
        await _db.SaveChangesAsync(ct);

        var result = new CreateLoanPurposeResult(purpose.Id, purpose.Name);

        return CreatedAtAction(
            nameof(Search),
            new { search = purpose.Name },
            result
        );
    }

    /// <summary>
    /// Get or create loan purpose (upsert for FreeSolo)
    /// POST /api/loan-purposes/get-or-create
    /// </summary>
    [HttpPost("get-or-create")]
    [ProducesResponseType(typeof(CreateLoanPurposeResult), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(CreateLoanPurposeResult), StatusCodes.Status201Created)]
    public async Task<IActionResult> GetOrCreate(
        [FromBody] CreateLoanPurposeCommand command,
        CancellationToken ct)
    {
        var name = command.Name?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            return Problem(
                title: "Validation Error",
                detail: "Name is required",
                statusCode: StatusCodes.Status400BadRequest
            );
        }

        // Try find existing
        var existing = await _db.LoanPurposes
            .AsNoTracking()
            .Where(p => p.IsActive && EF.Functions.ILike(p.Name, name))
            .Select(p => new CreateLoanPurposeResult(p.Id, p.Name))
            .FirstOrDefaultAsync(ct);

        if (existing is not null)
        {
            return Ok(existing);
        }

        // Create new
        var purpose = LoanPurpose.CreateCustom(name, _currentUser.MemberId);
        _db.LoanPurposes.Add(purpose);
        await _db.SaveChangesAsync(ct);

        return StatusCode(
            StatusCodes.Status201Created,
            new CreateLoanPurposeResult(purpose.Id, purpose.Name)
        );
    }
}

// =============================================================================
// DbContext Configuration
// =============================================================================

namespace Infrastructure.Persistence.Configurations;

using Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

public class LoanPurposeConfiguration : IEntityTypeConfiguration<LoanPurpose>
{
    public void Configure(EntityTypeBuilder<LoanPurpose> builder)
    {
        builder.ToTable("LoanPurposes");

        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Description)
            .HasMaxLength(500);

        // Index for search
        builder.HasIndex(x => x.Name)
            .HasMethod("gin")
            .HasOperators("gin_trgm_ops"); // PostgreSQL trigram for ILIKE

        // Unique constraint (case-insensitive)
        builder.HasIndex(x => x.Name)
            .IsUnique()
            .HasFilter("\"IsActive\" = true");

        // Seed system-defined purposes
        builder.HasData(
            new { Id = 1, Name = "Agriculture", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 2, Name = "Business", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 3, Name = "Education", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 4, Name = "Housing", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 5, Name = "Medical", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 6, Name = "Vehicle", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 7, Name = "Marriage", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow },
            new { Id = 8, Name = "Personal", IsSystemDefined = true, IsActive = true, CreatedAt = DateTime.UtcNow }
        );
    }
}

// =============================================================================
// PostgreSQL Migration for Trigram Search
// =============================================================================

/*
-- Enable pg_trgm extension for fast ILIKE searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create GIN index for trigram search
CREATE INDEX "IX_LoanPurposes_Name_Trgm" 
ON "LoanPurposes" 
USING gin ("Name" gin_trgm_ops);
*/
