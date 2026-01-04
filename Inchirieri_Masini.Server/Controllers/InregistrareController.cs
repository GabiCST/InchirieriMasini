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
public class InregistrareController : ControllerBase
{
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;

    public InregistrareController(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpPost("register")]
public IActionResult Register([FromBody] RegisterRequest request)
{
    if (!ModelState.IsValid) return BadRequest(ModelState);

    string hash = BCrypt.Net.BCrypt.HashPassword(request.Password);
    DateTime dataCreare = DateTime.Now;

    try 
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            connection.Open();
            string checkSql = "SELECT COUNT(*) FROM Users WHERE Email = ? OR Username = ?";
            using (OleDbCommand checkCmd = new OleDbCommand(checkSql, connection))
            {
                checkCmd.Parameters.AddWithValue("?", request.Email);
                checkCmd.Parameters.AddWithValue("?", request.Username);
                int count = Convert.ToInt32(checkCmd.ExecuteScalar());
                if (count > 0) return BadRequest("Email sau Username deja folosite.");
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
            int noulId;
            using (OleDbCommand idCmd = new OleDbCommand("SELECT @@IDENTITY", connection))
            {
                noulId = (int)idCmd.ExecuteScalar()!;
            }
            var token = GenerareToken(noulId.ToString(), request.Username);

            return Ok(new 
            { 
                mesaj = "Cont creat!", 
                token = token,
                utilizator = request.Username 
            });
        }
    }
    catch (Exception ex)
    {
        return StatusCode(500, ex.Message);
    }
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