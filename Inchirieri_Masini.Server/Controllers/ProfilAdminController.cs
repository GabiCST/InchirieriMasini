using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class ProfilAdminController : ControllerBase
{
    private readonly string _connectionString;

    public ProfilAdminController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpGet("detalii")]
    public async Task<IActionResult> GetProfilAdmin()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string sql = "SELECT ID, Nume_Prenume, NumarTelefon, EsteAdmin FROM Users WHERE ID = ?";
            using (OleDbCommand command = new OleDbCommand(sql, connection))
            {
                command.Parameters.AddWithValue("?", int.Parse(userId));
                await connection.OpenAsync();

                using (OleDbDataReader reader = (OleDbDataReader)await command.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        bool isAdmin = Convert.ToBoolean(reader["EsteAdmin"]);
                        if (!isAdmin) return Forbid();

                        string complet = reader["Nume_Prenume"]?.ToString() ?? "";
                        string[] parti = complet.Split(' ', 2);

                        return Ok(new {
                            nume = parti.Length > 0 ? parti[0] : "",
                            prenume = parti.Length > 1 ? parti[1] : "",
                            telefon = reader["NumarTelefon"]?.ToString()
                        });
                    }
                }
            }
        }
        return NotFound();
    }

    [HttpPost("salveaza")]
    public async Task<IActionResult> SalveazaProfilAdmin([FromBody] DatePersonaleProfileRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            string sql = "UPDATE Users SET Nume_Prenume = ?, NumarTelefon = ? WHERE ID = ? AND EsteAdmin <> 0";
            using (OleDbCommand cmd = new OleDbCommand(sql, connection))
            {
                cmd.Parameters.AddWithValue("?", $"{request.Nume} {request.Prenume}".Trim());
                cmd.Parameters.AddWithValue("?", request.Telefon);
                cmd.Parameters.AddWithValue("?", int.Parse(userId));
                
                int rows = await cmd.ExecuteNonQueryAsync();
                if (rows == 0) return Forbid();
            }
        }
        return Ok(new { message = "Date contact admin salvate!" });
    }
}