using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using BCrypt.Net;
using System.Runtime.Versioning;

[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class LogareController : ControllerBase
{
    private readonly string _connectionString;

    public LogareController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException("Connection string 'ServiceDb' not found.");
    }

[HttpPost("login")]
public IActionResult Login([FromBody] LoginRequest request)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    try
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            connection.Open();
            string sql = "SELECT Username, Parola FROM Users WHERE Username = ? OR Email = ?";

            using (OleDbCommand cmd = new OleDbCommand(sql, connection))
            {
                cmd.Parameters.AddWithValue("?", request.Identificator);
                cmd.Parameters.AddWithValue("?", request.Identificator);

                using (OleDbDataReader reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        string hashDinBazaDeDate = reader["Parola"].ToString()!;
                        string numeUtilizator = reader["Username"].ToString()!;

                        if (BCrypt.Net.BCrypt.Verify(request.Password, hashDinBazaDeDate))
                        {
                            return Ok(new
                            {
                                mesaj = "Logare reușită!",
                                utilizator = numeUtilizator
                            });
                        }
                    }
                }
            }
        }
        return Unauthorized("Date de logare incorecte!");
    }
    catch (Exception ex)
    {
        return StatusCode(500, $"Eroare la baza de date: {ex.Message}");
    }
}
}