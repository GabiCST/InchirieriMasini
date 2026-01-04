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
    [HttpGet("detalii")]
    public async Task<IActionResult> GetProfil()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string sql = @"SELECT u.Nume_Prenume, u.NumarTelefon, d.CI, d.Adresa, d.Serie_Carnet, d.Data_expirare 
                           FROM Users u 
                           LEFT JOIN Detalii_User d ON u.ID = d.Id_User 
                           WHERE u.ID = ?";

            using (OleDbCommand command = new OleDbCommand(sql, connection))
            {
                command.Parameters.AddWithValue("?", userId);
                await connection.OpenAsync();

                using (OleDbDataReader reader = (OleDbDataReader)await command.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        string numeComplet = reader["Nume_Prenume"]?.ToString() ?? "";
                        string nume = "";
                        string prenume = "";

                        if (!string.IsNullOrEmpty(numeComplet))
                        {
                            var parti = numeComplet.Split(' ', 2);
                            nume = parti[0];
                            prenume = parti.Length > 1 ? parti[1] : "";
                        }

                        return Ok(new {
                            Nume = nume,
                            Prenume = prenume,
                            Telefon = reader["NumarTelefon"]?.ToString(),
                            CI = reader["CI"]?.ToString(),
                            Adresa = reader["Adresa"]?.ToString(),
                            Serie_carnet = reader["Serie_Carnet"]?.ToString(),
                            Data_expirare = reader["Data_expirare"] != DBNull.Value 
                                            ? Convert.ToDateTime(reader["Data_expirare"]) 
                                            : (DateTime?)null
                        });
                    }
                }
            }
        }
        return NotFound();
    }

    [HttpPut("actualizare")]
    [HttpPost("salveaza")]
    public async Task<IActionResult> SalveazaProfil([FromBody] DatePersonaleRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        string numePrenumeUnit = $"{request.Nume} {request.Prenume}".Trim();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            bool esteAdmin = false;
            using (OleDbCommand checkAdmin = new OleDbCommand("SELECT EsteAdmin FROM Users WHERE ID = ?", connection))
            {
                checkAdmin.Parameters.AddWithValue("?", userId);
                esteAdmin = Convert.ToBoolean(await checkAdmin.ExecuteScalarAsync() ?? false);
            }

            string sqlUsers = "UPDATE Users SET Nume_Prenume = ?, NumarTelefon = ? WHERE ID = ?";
            using (OleDbCommand cmdUsers = new OleDbCommand(sqlUsers, connection))
            {
                cmdUsers.Parameters.AddWithValue("?", numePrenumeUnit);
                cmdUsers.Parameters.AddWithValue("?", request.Telefon);
                cmdUsers.Parameters.AddWithValue("?", userId);
                await cmdUsers.ExecuteNonQueryAsync();
            }
            if (!esteAdmin)
            {
                using (OleDbCommand checkCmd = new OleDbCommand("SELECT COUNT(*) FROM Detalii_User WHERE Id_User = ?", connection))
                {
                    checkCmd.Parameters.AddWithValue("?", userId);
                    bool exista = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;

                    if (exista)
                    {
                        string updateSql = "UPDATE Detalii_User SET CI = ?, Adresa = ?, Serie_Carnet = ?, Data_expirare = ? WHERE Id_User = ?";
                        using (OleDbCommand cmd = new OleDbCommand(updateSql, connection))
                        {
                            cmd.Parameters.AddWithValue("?", request.CI);
                            cmd.Parameters.AddWithValue("?", request.Adresa);
                            cmd.Parameters.AddWithValue("?", request.Serie_carnet);
                            cmd.Parameters.AddWithValue("?", request.Data_expirare);
                            cmd.Parameters.AddWithValue("?", userId);
                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                    else
                    {
                        string insertSql = "INSERT INTO Detalii_User (Id_User, CI, Adresa, Serie_Carnet, Data_expirare, Bani) VALUES (?, ?, ?, ?, ?, 0)";
                        using (OleDbCommand cmd = new OleDbCommand(insertSql, connection))
                        {
                            cmd.Parameters.AddWithValue("?", userId);
                            cmd.Parameters.AddWithValue("?", request.CI);
                            cmd.Parameters.AddWithValue("?", request.Adresa);
                            cmd.Parameters.AddWithValue("?", request.Serie_carnet);
                            cmd.Parameters.AddWithValue("?", request.Data_expirare);
                            await cmd.ExecuteNonQueryAsync();
                        }
                    }
                }
            }

            return Ok(new { message = "Profil salvat cu succes!" });
        }
    }
}
