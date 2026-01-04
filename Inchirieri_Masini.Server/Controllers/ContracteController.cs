using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class ContracteController : ControllerBase
{
    private readonly string _connectionString;

    public ContracteController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpPost]
    public IActionResult Create([FromBody] ContracteRequest request)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = "INSERT INTO Contracte (ID_Client, Id_Autovehicul, Data_Intocmiri, Data_Inchiriere, Data_Returnare, Status_Contract, Suma_Totala_Estimata) " +
                           "VALUES (?, ?, ?, ?, ?, ?, ?)";

            OleDbCommand command = new OleDbCommand(query, connection);
            
            command.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Client;
            command.Parameters.Add("?", OleDbType.Integer).Value = request.Id_Autovehicul;
            command.Parameters.Add("?", OleDbType.Date).Value = request.Data_Intocmiri;
            command.Parameters.Add("?", OleDbType.Date).Value = request.Data_Inchiriere;
            command.Parameters.Add("?", OleDbType.Date).Value = request.Data_Returnare;
            command.Parameters.Add("?", OleDbType.VarWChar).Value = request.Status_Contract;
            command.Parameters.Add("?", OleDbType.Currency).Value = request.Suma_Totala_Estimata;

            connection.Open();
            command.ExecuteNonQuery();
        }
        return Ok(new { message = "Contractul a fost înregistrat cu succes!" });
    }

    [HttpGet("user")]
    public IActionResult GetByUser()
    {
        // Această linie acum va funcționa corect
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var contracte = new List<object>();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = @"SELECT c.ID_Contract, c.Data_Inchiriere, c.Data_Returnare, 
                                   c.Status_Contract, c.Suma_Totala_Estimata, c.Id_Autovehicul,
                                   a.Model, a.Numar_Inmatriculare
                            FROM Contracte c
                            INNER JOIN Autovehicule a ON c.Id_Autovehicul = a.ID_Autovehicul
                            WHERE c.ID_Client = ?
                            ORDER BY c.Data_Intocmiri DESC";

            OleDbCommand command = new OleDbCommand(query, connection);
            command.Parameters.AddWithValue("?", userId);

            try
            {
                connection.Open();
                using (OleDbDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        contracte.Add(new
                        {
                            id_Contract = reader["ID_Contract"],
                            data_Inchiriere = reader["Data_Inchiriere"],
                            data_Returnare = reader["Data_Returnare"],
                            status_Contract = reader["Status_Contract"],
                            suma_Totala_Estimata = reader["Suma_Totala_Estimata"],
                            id_Autovehicul = reader["Id_Autovehicul"],
                            modelMasina = reader["Model"],
                            numarMasina = reader["Numar_Inmatriculare"]
                        });
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }
        return Ok(contracte);
    }

    [HttpPut("anulare/{id}")]
    public IActionResult AnuleazaContract(int id)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = "UPDATE Contracte SET Status_Contract = 'Anulat' WHERE ID_Contract = ?";
            
            OleDbCommand command = new OleDbCommand(query, connection);
            command.Parameters.Add("?", OleDbType.Integer).Value = id;

            connection.Open();
            int rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0)
            {
                return NotFound(new { message = "Contractul nu a fost găsit." });
            }
        }
        return Ok(new { message = "Contractul a fost anulat cu succes." });
    }
}