using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class AdminMasiniController : ControllerBase
{
    private readonly string _connectionString;

    public AdminMasiniController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string 'ServiceDb' not found.");
    }

    [HttpPost("adaugare")]
    public async Task<IActionResult> AdaugaMasina([FromBody] Masina request)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            using (OleDbTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    int newCarId = 0;
                    string sqlMasina = @"INSERT INTO Autovehicule (Model, Numar_Inmatriculare, AnFabricatie, Tarif_Inchiriere, Poza, Motorizare, Descriere) 
                                       VALUES (?, ?, ?, ?, ?, ?, ?)";

                    using (OleDbCommand cmd = new OleDbCommand(sqlMasina, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("?", request.Model);
                        cmd.Parameters.AddWithValue("?", request.Numar_Inmatriculare);
                        cmd.Parameters.AddWithValue("?", request.An);
                        cmd.Parameters.AddWithValue("?", request.Pret);
                        cmd.Parameters.AddWithValue("?", request.Img);
                        cmd.Parameters.AddWithValue("?", request.Motorizare);
                        cmd.Parameters.AddWithValue("?", request.Descriere);

                        await cmd.ExecuteNonQueryAsync();

                        cmd.CommandText = "SELECT @@IDENTITY";
                       var result = await cmd.ExecuteScalarAsync();
                       newCarId = result != null && result != DBNull.Value ? Convert.ToInt32(result) : 0;
                    }

                    if (request.Dotari != null && request.Dotari.Count > 0)
                    {
                        foreach (var dotareIdStr in request.Dotari)
                        {
                            if (int.TryParse(dotareIdStr, out int dotareId))
                            {
                                string sqlDotari = "INSERT INTO Autovehicul_dotari (ID_Autovehicul, ID_Dotare) VALUES (?, ?)";
                                using (OleDbCommand cmdDot = new OleDbCommand(sqlDotari, connection, transaction))
                                {
                                    cmdDot.Parameters.AddWithValue("?", newCarId);
                                    cmdDot.Parameters.AddWithValue("?", dotareId);
                                    await cmdDot.ExecuteNonQueryAsync();
                                }
                            }
                        }
                    }

                    if (request.Conditii != null && request.Conditii.Count > 0)
                    {
                        foreach (var conditieIdStr in request.Conditii)
                        {
                            if (int.TryParse(conditieIdStr, out int conditieId))
                            {
                                string sqlConditii = "INSERT INTO Autovehicul_conditii (ID_Autovehicul, ID_Conditie) VALUES (?, ?)";
                                using (OleDbCommand cmdCond = new OleDbCommand(sqlConditii, connection, transaction))
                                {
                                    cmdCond.Parameters.AddWithValue("?", newCarId);
                                    cmdCond.Parameters.AddWithValue("?", conditieId);
                                    await cmdCond.ExecuteNonQueryAsync();
                                }
                            }
                        }
                    }

                    transaction.Commit();
                    return Ok(new { message = "Autovehicul adăugat cu succes!", id = newCarId });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, $"Eroare la salvare: {ex.Message}");
                }
            }
        }
    }
    [HttpGet("preluare/{id}")]
    public async Task<IActionResult> GetMasinaEditare(int id)
    {
        Masina? masina = null; 

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            
            string sqlMasina = "SELECT * FROM Autovehicule WHERE ID_Autovehicul = ?";
            using (OleDbCommand cmd = new OleDbCommand(sqlMasina, connection))
            {
                cmd.Parameters.AddWithValue("?", id);
                using (OleDbDataReader reader = (OleDbDataReader)await cmd.ExecuteReaderAsync())
                {
                    if (reader.Read())
                    {
                        masina = new Masina
                        {
                            Id = Convert.ToInt32(reader["ID_Autovehicul"]),
                            Model = reader["Model"]?.ToString() ?? "",
                            An = Convert.ToInt32(reader["AnFabricatie"]),
                            Numar_Inmatriculare = reader["Numar_Inmatriculare"]?.ToString() ?? "",
                            Pret = Convert.ToInt32(reader["Tarif_Inchiriere"]),
                            Img = reader["Poza"]?.ToString() ?? "",
                            Motorizare = reader["Motorizare"]?.ToString() ?? "",
                            Descriere = reader["Descriere"]?.ToString() ?? ""
                        };
                    }
                }
            }
            if (masina == null) return NotFound();
            string sqlDotari = "SELECT ID_Dotare FROM Autovehicul_dotari WHERE ID_Autovehicul = ?";
            using (OleDbCommand cmdDot = new OleDbCommand(sqlDotari, connection))
            {
                cmdDot.Parameters.AddWithValue("?", id);
                using (OleDbDataReader reader = (OleDbDataReader)await cmdDot.ExecuteReaderAsync())
                {
                    while (reader.Read()) 
                    {
                        string dotareId = reader["ID_Dotare"]?.ToString() ?? "";
                        if (!string.IsNullOrEmpty(dotareId)) masina.Dotari.Add(dotareId);
                    }
                }
            }
            string sqlConditii = "SELECT ID_Conditie FROM Autovehicul_conditii WHERE ID_Autovehicul = ?";
            using (OleDbCommand cmdCond = new OleDbCommand(sqlConditii, connection))
            {
                cmdCond.Parameters.AddWithValue("?", id);
                using (OleDbDataReader reader = (OleDbDataReader)await cmdCond.ExecuteReaderAsync())
                {
                    while (reader.Read()) 
                    {
                        string conditieId = reader["ID_Conditie"]?.ToString() ?? "";
                        if (!string.IsNullOrEmpty(conditieId)) masina.Conditii.Add(conditieId);
                    }
                }
            }
        }

        return Ok(masina);
    }

    [HttpPut("modificare/{id}")]
    public async Task<IActionResult> ModificaMasina(int id, [FromBody] Masina request)
    {
        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();
            using (OleDbTransaction transaction = connection.BeginTransaction())
            {
                try
                {
                    string sqlUpdate = @"UPDATE Autovehicule SET Model=?, Numar_Inmatriculare=?, AnFabricatie=?, 
                                    Tarif_Inchiriere=?, Poza=?, Motorizare=?, Descriere=? WHERE ID_Autovehicul=?";
                    
                    using (OleDbCommand cmd = new OleDbCommand(sqlUpdate, connection, transaction))
                    {
                        cmd.Parameters.AddWithValue("?", request.Model);
                        cmd.Parameters.AddWithValue("?", request.Numar_Inmatriculare);
                        cmd.Parameters.AddWithValue("?", request.An);
                        cmd.Parameters.AddWithValue("?", request.Pret);
                        cmd.Parameters.AddWithValue("?", request.Img);
                        cmd.Parameters.AddWithValue("?", request.Motorizare);
                        cmd.Parameters.AddWithValue("?", request.Descriere);
                        cmd.Parameters.AddWithValue("?", id);
                        await cmd.ExecuteNonQueryAsync();
                    }

                    using (OleDbCommand delDot = new OleDbCommand("DELETE FROM Autovehicul_dotari WHERE ID_Autovehicul=?", connection, transaction))
                    {
                        delDot.Parameters.AddWithValue("?", id);
                        await delDot.ExecuteNonQueryAsync();
                    }

                    foreach (var dotId in request.Dotari)
                    {
                        using (OleDbCommand insDot = new OleDbCommand("INSERT INTO Autovehicul_dotari (ID_Autovehicul, ID_Dotare) VALUES (?,?)", connection, transaction))
                        {
                            insDot.Parameters.AddWithValue("?", id);
                            insDot.Parameters.AddWithValue("?", int.Parse(dotId));
                            await insDot.ExecuteNonQueryAsync();
                        }
                    }

                    using (OleDbCommand delCond = new OleDbCommand("DELETE FROM Autovehicul_conditii WHERE ID_Autovehicul=?", connection, transaction))
                    {
                        delCond.Parameters.AddWithValue("?", id);
                        await delCond.ExecuteNonQueryAsync();
                    }

                    foreach (var condId in request.Conditii)
                    {
                        using (OleDbCommand insCond = new OleDbCommand("INSERT INTO Autovehicul_conditii (ID_Autovehicul, ID_Conditie) VALUES (?,?)", connection, transaction))
                        {
                            insCond.Parameters.AddWithValue("?", id);
                            insCond.Parameters.AddWithValue("?", int.Parse(condId));
                            await insCond.ExecuteNonQueryAsync();
                        }
                    }

                    transaction.Commit();
                    return Ok(new { message = "Datele au fost actualizate!" });
                }
                catch (Exception ex)
                {
                    transaction.Rollback();
                    return StatusCode(500, ex.Message);
                }
            }
        }
    }
}