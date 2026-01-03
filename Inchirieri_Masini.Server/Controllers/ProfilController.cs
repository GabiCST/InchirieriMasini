using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]

public class ProfilController : ControllerBase
{
    private readonly string _connectionString;

    public ProfilController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string 'ServiceDb' not found.");
    }

    [Authorize]
    [HttpPost("finalizare")]
    public async Task<IActionResult> FinalizareProfil([FromBody] FinalizareProfilRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string sql = "UPDATE Users SET Nume_Prenume = ?, NumarTelefon = ? WHERE ID = ?";
            using (OleDbCommand command = new OleDbCommand(sql, connection))
            {
                command.Parameters.AddWithValue("?", $"{request.Nume} {request.Prenume}");
                command.Parameters.AddWithValue("?", request.Telefon);
                command.Parameters.AddWithValue("?", userId); // Folosim ID-ul scos din token

                connection.Open();
                command.ExecuteNonQuery();
                return Ok();
            }
        }
    }
}