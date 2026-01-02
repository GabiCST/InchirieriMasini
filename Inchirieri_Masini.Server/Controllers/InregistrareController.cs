using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using BCrypt.Net;
using System.Runtime.Versioning;

[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class InregistrareController : ControllerBase
{
    private readonly string _connectionString;

    public InregistrareController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException("Connection string 'ServiceDb' not found.");
    }

    [HttpPost("register")]
    public IActionResult Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);
        string hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
        DateTime data = DateTime.Now;
        DateTime dataCreare = new DateTime(data.Year, data.Month, data.Day, data.Hour, data.Minute, data.Second);
        try 
        {
            using (OleDbConnection connection = new OleDbConnection(_connectionString))
            {
                connection.Open();
                string checkSql = "SELECT COUNT(*) FROM Users WHERE Email = ?";
                using (OleDbCommand checkCmd = new OleDbCommand(checkSql, connection))
                {
                    checkCmd.Parameters.AddWithValue("?", request.Email);
                    object? result = checkCmd.ExecuteScalar();
                    int count = result != null ? Convert.ToInt32(result) : 0;
                    if (count > 0) return BadRequest("Email-ul există deja!");
                }
                string check2Sql = "SELECT COUNT(*) FROM Users WHERE Username = ?";
                using (OleDbCommand checkCmd = new OleDbCommand(check2Sql, connection))
                {
                    checkCmd.Parameters.AddWithValue("?", request.Username);
                    object? result = checkCmd.ExecuteScalar();
                    int count = result != null ? Convert.ToInt32(result) : 0;
                    if (count > 0) return BadRequest("Numele de utilizator există deja!");
                }
                string insertSql = "INSERT INTO Users (Username, Email, Parola, DataCreare) VALUES (?, ?, ?, ?)";
                using (OleDbCommand insertCmd = new OleDbCommand(insertSql, connection))
                {
                    insertCmd.Parameters.AddWithValue("?", request.Username);
                    insertCmd.Parameters.AddWithValue("?", request.Email);
                    insertCmd.Parameters.AddWithValue("?", hash);
                    insertCmd.Parameters.AddWithValue("?", dataCreare);

                    insertCmd.ExecuteNonQuery();
                }
            }
            return Ok(new { mesaj = "Cont creat cu succes!" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Eroare la baza de date: {ex.Message}");
        }
    }
}