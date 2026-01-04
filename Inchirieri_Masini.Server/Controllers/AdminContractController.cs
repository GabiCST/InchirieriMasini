using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Security.Claims;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class AdminContractController : ControllerBase
{
    private readonly string _connectionString;

    public AdminContractController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var contracte = new List<object>();
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = @"SELECT c.ID_Contract, c.ID_Client, c.Id_Autovehicul, c.Data_Inchiriere, 
                                c.Data_Returnare, c.Status_Contract, 
                                u.Nume_Prenume AS NumeClient, 
                                a.Model AS ModelMasina
                            FROM (Contracte c
                            INNER JOIN Users u ON c.ID_Client = u.ID)
                            INNER JOIN Autovehicule a ON c.Id_Autovehicul = a.ID_Autovehicul
                            ORDER BY c.Data_Intocmiri DESC";

            OleDbCommand command = new OleDbCommand(query, connection);
            try
            {
                connection.Open();
                using (OleDbDataReader reader = command.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        contracte.Add(new
                        {
                            iD_Contract = reader["ID_Contract"],
                            numeClient = reader["NumeClient"],
                            modelMasina = reader["ModelMasina"],
                            data_Inchiriere = reader["Data_Inchiriere"],
                            data_Returnare = reader["Data_Returnare"],
                            status = reader["Status_Contract"]
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
    [HttpPut("accepta/{id}")]
    public IActionResult AcceptaContract(int id)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = "UPDATE Contracte SET Status_Contract = 'Acceptat' WHERE ID_Contract = ?";
            OleDbCommand command = new OleDbCommand(query, connection);
            command.Parameters.Add("?", OleDbType.Integer).Value = id;

            connection.Open();
            int rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0) return NotFound();
        }
        return Ok(new { message = "Contractul a fost aprobat." });
    }

    [HttpPost("finalizeaza")]
    public IActionResult FinalizeazaContract([FromBody] FinalizareRequest request)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            connection.Open();
            using (OleDbTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    string sqlFinalizare = "INSERT INTO FinalizareContract (ID_Contract, Data_returnare_efectiva, Suma_Penalizare, Rest, Observatii_Returnare) VALUES (?, ?, ?, ?, ?)";
                    using (OleDbCommand cmdFinalizare = new OleDbCommand(sqlFinalizare, connection, transaction))
                    {
                        cmdFinalizare.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmdFinalizare.Parameters.Add("?", OleDbType.Date).Value = request.Data_Returnare_Efectiva;
                        cmdFinalizare.Parameters.Add("?", OleDbType.Currency).Value = request.Suma_Penalizare;
                        cmdFinalizare.Parameters.Add("?", OleDbType.Currency).Value = request.Rest;
                        cmdFinalizare.Parameters.Add("?", OleDbType.VarWChar).Value = request.Observatii_Returnare;
                        cmdFinalizare.ExecuteNonQuery();
                    }

                    string sqlUpdateStatus = "UPDATE Contracte SET Status_Contract = 'Finalizat' WHERE ID_Contract = ?";
                    using (OleDbCommand cmdUpdate = new OleDbCommand(sqlUpdateStatus, connection, transaction))
                    {
                        cmdUpdate.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmdUpdate.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok(new { message = "Contract finalizat" });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, new { message = ex.Message });
                }
            }
        }
    }
}