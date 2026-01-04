using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Runtime.Versioning;

[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class LogareController : ControllerBase
{
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;

    public LogareController(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpPost("login")]
public IActionResult Login([FromBody] LoginRequest request)
{
    using (OleDbConnection connection = new OleDbConnection(_connectionString))
    {
        connection.Open();
        string sql = "SELECT ID, Username, Parola, Nume_Prenume, NumarTelefon FROM Users WHERE Username = ? OR Email = ?";
        using (OleDbCommand cmd = new OleDbCommand(sql, connection))
        {
            cmd.Parameters.AddWithValue("?", request.Identificator);
            cmd.Parameters.AddWithValue("?", request.Identificator);

            using (OleDbDataReader reader = cmd.ExecuteReader())
            {
                if (reader.Read())
                {
                    string hash = reader["Parola"].ToString()!;
                    if (BCrypt.Net.BCrypt.Verify(request.Password, hash))
                    {
                        var token = GenerareToken(reader["ID"].ToString()!, reader["Username"].ToString()!);
                        
                        bool esteProfilComplet = reader["Nume_Prenume"] != DBNull.Value && 
                                               reader["NumarTelefon"] != DBNull.Value;

                        return Ok(new { 
                            token = token, 
                            utilizator = reader["Username"].ToString(),
                            profilComplet = esteProfilComplet 
                        });
                    }
                }
            }
        }
    }
    return Unauthorized("Date de logare incorecte.");
}
private string GenerareToken(string id, string nume)
{
    var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Key"]!);
    var descriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[] { 
            new Claim(ClaimTypes.NameIdentifier, id),
            new Claim(ClaimTypes.Name, nume) 
        }),
        Expires = DateTime.UtcNow.AddDays(1),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    var handler = new JwtSecurityTokenHandler();
    var token = handler.CreateToken(descriptor);
    return handler.WriteToken(token);
}
}