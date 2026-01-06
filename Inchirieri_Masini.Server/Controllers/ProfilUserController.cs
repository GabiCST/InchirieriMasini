using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class ProfilUserController : ControllerBase
{
    private readonly string _connectionString;

    public ProfilUserController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpGet("detalii")]
    public async Task<IActionResult> GetProfilUser()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string sql = @"SELECT u.ID, u.Nume_Prenume, u.NumarTelefon, d.CI, d.Adresa, d.Serie_Carnet, d.Data_expirare 
                           FROM Users u 
                           LEFT JOIN Detalii_User d ON u.ID = d.Id_User 
                           WHERE u.ID = ? AND u.EsteAdmin = 0";

            using (OleDbCommand command = new OleDbCommand(sql, connection))
            {
                command.Parameters.AddWithValue("?", int.Parse(userId));
                await connection.OpenAsync();

                using (OleDbDataReader reader = (OleDbDataReader)await command.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        string complet = reader["Nume_Prenume"]?.ToString() ?? "";
                        string[] parti = complet.Split(' ', 2);

                        return Ok(new {
                            id = Convert.ToInt32(reader["ID"]),
                            nume = parti.Length > 0 ? parti[0] : "",
                            prenume = parti.Length > 1 ? parti[1] : "",
                            telefon = reader["NumarTelefon"]?.ToString(),
                            ci = reader["CI"]?.ToString(),
                            adresa = reader["Adresa"]?.ToString(),
                            serie_carnet = reader["Serie_Carnet"]?.ToString(),
                            data_expirare = reader["Data_expirare"] != DBNull.Value ? Convert.ToDateTime(reader["Data_expirare"]).ToString("yyyy-MM-dd") : null
                        });
                    }
                }
            }
        }
        return NotFound();
    }

    [HttpPost("salveaza")]
    public async Task<IActionResult> SalveazaProfilUser([FromBody] DatePersonaleRequest request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            
            string sqlUsers = "UPDATE Users SET Nume_Prenume = ?, NumarTelefon = ? WHERE ID = ? AND EsteAdmin = 0";
            using (OleDbCommand cmdUsers = new OleDbCommand(sqlUsers, connection))
            {
                cmdUsers.Parameters.AddWithValue("?", $"{request.Nume} {request.Prenume}".Trim());
                cmdUsers.Parameters.AddWithValue("?", request.Telefon);
                cmdUsers.Parameters.AddWithValue("?", int.Parse(userId));
                int rows = await cmdUsers.ExecuteNonQueryAsync();
                if (rows == 0) return Forbid();
            }

            using (OleDbCommand checkCmd = new OleDbCommand("SELECT COUNT(*) FROM Detalii_User WHERE Id_User = ?", connection))
            {
                checkCmd.Parameters.AddWithValue("?", int.Parse(userId));
                bool exista = Convert.ToInt32(await checkCmd.ExecuteScalarAsync()) > 0;

                if (exista)
                {
                    string sqlUpdate = "UPDATE Detalii_User SET CI = ?, Adresa = ?, Serie_Carnet = ?, Data_expirare = ? WHERE Id_User = ?";
                    using (OleDbCommand cmd = new OleDbCommand(sqlUpdate, connection))
                    {
                        cmd.Parameters.AddWithValue("?", (object?)request.CI ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Adresa ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Serie_carnet ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Data_expirare ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", int.Parse(userId));
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
                else
                {
                    string sqlInsert = "INSERT INTO Detalii_User (Id_User, CI, Adresa, Serie_Carnet, Data_expirare, Bani) VALUES (?, ?, ?, ?, ?, 0)";
                    using (OleDbCommand cmd = new OleDbCommand(sqlInsert, connection))
                    {
                        cmd.Parameters.AddWithValue("?", int.Parse(userId));
                        cmd.Parameters.AddWithValue("?", (object?)request.CI ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Adresa ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Serie_carnet ?? DBNull.Value);
                        cmd.Parameters.AddWithValue("?", (object?)request.Data_expirare ?? DBNull.Value);
                        await cmd.ExecuteNonQueryAsync();
                    }
                }
            }
        }
        return Ok(new { message = "Profil utilizator salvat!" });
    }
}