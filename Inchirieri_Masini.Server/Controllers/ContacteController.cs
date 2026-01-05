using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class ContacteController : ControllerBase
{
    private readonly string _connectionString;

    public ContacteController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpGet("admins")]
public async Task<IActionResult> GetAdminsContact()
{
    var adminContacts = new List<DatePersonaleProfileRequest>();

    using (OleDbConnection conn = new OleDbConnection(_connectionString))
    {
        await conn.OpenAsync();
        // Modificare: EsteAdmin = True (specific Access) sau EsteAdmin = -1
        string sql = @"SELECT Nume_Prenume, NumarTelefon 
                       FROM Users 
                       WHERE EsteAdmin = True 
                       AND Nume_Prenume IS NOT NULL 
                       AND NumarTelefon IS NOT NULL";

        using (OleDbCommand cmd = new OleDbCommand(sql, conn))
        using (OleDbDataReader r = (OleDbDataReader)await cmd.ExecuteReaderAsync())
        {
            while (r.Read())
            {
                string complet = r["Nume_Prenume"].ToString() ?? "";
                string[] parti = complet.Split(' ', 2);

                adminContacts.Add(new DatePersonaleProfileRequest
                {
                    // Asigură-te că aceste nume de proprietăți sunt cele așteptate de React
                    Nume = parti.Length > 0 ? parti[0] : "",
                    Prenume = parti.Length > 1 ? parti[1] : "",
                    Telefon = r["NumarTelefon"].ToString() ?? ""
                });
            }
        }
    }

    return Ok(adminContacts);
}
}