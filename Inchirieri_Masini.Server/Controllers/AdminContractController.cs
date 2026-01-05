using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
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
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException();
    }

    [HttpGet]
    public IActionResult GetAll()
    {
        var contracte = new List<object>();
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = @"SELECT c.*, u.Nume_Prenume AS NumeClient, a.Model AS ModelMasina, f.Suma_Penalizare, f.Rest
                            FROM ((Contracte c
                            INNER JOIN Users u ON c.ID_Client = u.ID)
                            INNER JOIN Autovehicule a ON c.Id_Autovehicul = a.ID_Autovehicul)
                            LEFT JOIN FinalizareContract f ON c.ID_Contract = f.ID_Contract
                            ORDER BY c.Data_Intocmiri DESC";
            OleDbCommand command = new OleDbCommand(query, connection);
            connection.Open();
            using (OleDbDataReader reader = command.ExecuteReader())
            {
                while (reader.Read())
                {
                    contracte.Add(new {
                        iD_Contract = reader["ID_Contract"],
                        numeClient = reader["NumeClient"],
                        modelMasina = reader["ModelMasina"],
                        data_Inchiriere = reader["Data_Inchiriere"],
                        data_Returnare = reader["Data_Returnare"],
                        status = reader["Status_Contract"],
                        sumaTotala = reader["Suma_Totala_Estimata"] != DBNull.Value ? Convert.ToInt32(reader["Suma_Totala_Estimata"]) : 0,
                        avans = reader["Avans"] != DBNull.Value ? Convert.ToInt32(reader["Avans"]) : 0,
                        rest = reader["Rest"] != DBNull.Value ? Convert.ToInt32(reader["Rest"]) : 0,
                        penalizare = reader["Suma_Penalizare"] != DBNull.Value ? Convert.ToInt32(reader["Suma_Penalizare"]) : 0
                    });
                }
            }
        }
        return Ok(contracte);
    }

    [HttpPut("schimba-status/{id}")]
    public IActionResult SchimbaStatus(int id, [FromBody] string noulStatus)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            string query = "UPDATE Contracte SET Status_Contract = ? WHERE ID_Contract = ?";
            OleDbCommand command = new OleDbCommand(query, connection);
            command.Parameters.Add("?", OleDbType.VarWChar).Value = noulStatus;
            command.Parameters.Add("?", OleDbType.Integer).Value = id;
            connection.Open();
            command.ExecuteNonQuery();
        }
        return Ok();
    }

    [HttpPost("incaseaza-avans")]
    public IActionResult IncaseazaAvans([FromBody] AvansRequest request)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            connection.Open();
            using (OleDbTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    string sqlUpdate = "UPDATE Contracte SET Avans = ?, Status_Contract = 'In inchiriere' WHERE ID_Contract = ?";
                    using (OleDbCommand cmd = new OleDbCommand(sqlUpdate, connection, transaction))
                    {
                        cmd.Parameters.Add("?", OleDbType.Integer).Value = request.SumaAvans;
                        cmd.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmd.ExecuteNonQuery();
                    }

                    string sqlFactura = "INSERT INTO Factura (Data_Intocmiri, ID_Contract, Tip_plata, Suma, Tip_factura) VALUES (?, ?, ?, ?, 'Avans')";
                    using (OleDbCommand cmdFactura = new OleDbCommand(sqlFactura, connection, transaction))
                    {
                        cmdFactura.Parameters.Add("?", OleDbType.Date).Value = DateTime.Now;
                        cmdFactura.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmdFactura.Parameters.Add("?", OleDbType.VarWChar).Value = request.MetodaPlata;
                        cmdFactura.Parameters.Add("?", OleDbType.Integer).Value = request.SumaAvans;
                        cmdFactura.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok();
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, new { message = ex.Message });
                }
            }
        }
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
                        cmdFinalizare.Parameters.Add("?", OleDbType.Integer).Value = request.Suma_Penalizare;
                        cmdFinalizare.Parameters.Add("?", OleDbType.Integer).Value = request.Rest;
                        cmdFinalizare.Parameters.Add("?", OleDbType.VarWChar).Value = request.Observatii_Returnare;
                        cmdFinalizare.ExecuteNonQuery();
                    }

                    int totalFinal = request.Rest + request.Suma_Penalizare;
                    string sqlFactura = "INSERT INTO Factura (Data_Intocmiri, ID_Contract, Tip_plata, Suma, Tip_factura) VALUES (?, ?, ?, ?, 'Finalizare')";
                    using (OleDbCommand cmdFactura = new OleDbCommand(sqlFactura, connection, transaction))
                    {
                        cmdFactura.Parameters.Add("?", OleDbType.Date).Value = DateTime.Now;
                        cmdFactura.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmdFactura.Parameters.Add("?", OleDbType.VarWChar).Value = request.MetodaPlataRest;
                        cmdFactura.Parameters.Add("?", OleDbType.Integer).Value = totalFinal;
                        cmdFactura.ExecuteNonQuery();
                    }

                    string sqlUpdateStatus = "UPDATE Contracte SET Status_Contract = 'Finalizat' WHERE ID_Contract = ?";
                    using (OleDbCommand cmdUpdate = new OleDbCommand(sqlUpdateStatus, connection, transaction))
                    {
                        cmdUpdate.Parameters.Add("?", OleDbType.Integer).Value = request.ID_Contract;
                        cmdUpdate.ExecuteNonQuery();
                    }

                    transaction.Commit();
                    return Ok();
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
