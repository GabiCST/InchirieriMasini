using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Runtime.Versioning;
using System.Security.Claims;

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
            ?? throw new InvalidOperationException("Connection string not found.");
    }

    [HttpGet("dotari-toate")]
    public async Task<IActionResult> GetToateDotarile()
    {
        var list = new List<object>();
        using (OleDbConnection conn = new OleDbConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (OleDbCommand cmd = new OleDbCommand("SELECT ID_Dotare, Dotare FROM Dotari", conn))
            using (OleDbDataReader r = (OleDbDataReader)await cmd.ExecuteReaderAsync())
            {
                while (r.Read()) 
                {
                    list.Add(new { Id = r["ID_Dotare"], Nume = r["Dotare"]?.ToString() });
                }
            }
        }
        return Ok(list);
    }

    [HttpGet("conditii-toate")]
    public async Task<IActionResult> GetToateConditiile()
    {
        var list = new List<object>();
        using (OleDbConnection conn = new OleDbConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (OleDbCommand cmd = new OleDbCommand("SELECT ID_Conditie, Conditie FROM Conditii", conn))
            using (OleDbDataReader r = (OleDbDataReader)await cmd.ExecuteReaderAsync())
            {
                while (r.Read()) 
                {
                    list.Add(new { Id = r["ID_Conditie"], Nume = r["Conditie"]?.ToString() });
                }
            }
        }
        return Ok(list);
    }

    [HttpGet("preluare/{id}")]
    public async Task<IActionResult> GetMasinaEditare(int id)
    {
        Masina? masina = null;
        using (OleDbConnection conn = new OleDbConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (OleDbCommand cmd = new OleDbCommand("SELECT * FROM Autovehicule WHERE ID_Autovehicul = ?", conn))
            {
                cmd.Parameters.AddWithValue("?", id);
                using (OleDbDataReader r = (OleDbDataReader)await cmd.ExecuteReaderAsync())
                {
                    if (r.Read())
                    {
                        masina = new Masina {
                            Id = Convert.ToInt32(r["ID_Autovehicul"]),
                            Model = r["Model"]?.ToString() ?? "",
                            An = Convert.ToInt32(r["AnFabricatie"]),
                            Numar_Inmatriculare = r["Numar_Inmatriculare"]?.ToString() ?? "",
                            Pret = Convert.ToInt32(r["Tarif_Inchiriere"]),
                            Img = r["Poza"]?.ToString() ?? "",
                            Motorizare = r["Motorizare"]?.ToString() ?? "",
                            Descriere = r["Descriere"]?.ToString() ?? ""
                        };
                    }
                }
            }

            if (masina == null) return NotFound();

            using (OleDbCommand cDot = new OleDbCommand("SELECT ID_Dotare FROM Autovehicul_dotari WHERE ID_Autovehicul = ?", conn))
            {
                cDot.Parameters.AddWithValue("?", id);
                using (OleDbDataReader r = (OleDbDataReader)await cDot.ExecuteReaderAsync())
                {
                    while (r.Read()) 
                    {
                        string idDot = r["ID_Dotare"]?.ToString() ?? "";
                        if (!string.IsNullOrEmpty(idDot)) masina.Dotari.Add(idDot);
                    }
                }
            }

            using (OleDbCommand cCond = new OleDbCommand("SELECT ID_Conditie FROM Autovehicul_conditii WHERE ID_Autovehicul = ?", conn))
            {
                cCond.Parameters.AddWithValue("?", id);
                using (OleDbDataReader r = (OleDbDataReader)await cCond.ExecuteReaderAsync())
                {
                    while (r.Read()) 
                    {
                        string idCond = r["ID_Conditie"]?.ToString() ?? "";
                        if (!string.IsNullOrEmpty(idCond)) masina.Conditii.Add(idCond);
                    }
                }
            }
        }
        return Ok(masina);
    }

    [HttpPost("adaugare")]
    public async Task<IActionResult> AdaugaMasina([FromBody] Masina req)
    {
        using (OleDbConnection conn = new OleDbConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (OleDbTransaction tx = conn.BeginTransaction())
            {
                try
                {
                    int carId = 0;
                    string sql = "INSERT INTO Autovehicule (Model, Numar_Inmatriculare, AnFabricatie, Tarif_Inchiriere, Poza, Motorizare, Descriere) VALUES (?,?,?,?,?,?,?)";
                    using (OleDbCommand cmd = new OleDbCommand(sql, conn, tx))
                    {
                        cmd.Parameters.AddWithValue("?", req.Model);
                        cmd.Parameters.AddWithValue("?", req.Numar_Inmatriculare);
                        cmd.Parameters.AddWithValue("?", req.An);
                        cmd.Parameters.AddWithValue("?", req.Pret);
                        cmd.Parameters.AddWithValue("?", req.Img);
                        cmd.Parameters.AddWithValue("?", req.Motorizare);
                        cmd.Parameters.AddWithValue("?", req.Descriere);
                        await cmd.ExecuteNonQueryAsync();

                        cmd.CommandText = "SELECT @@IDENTITY";
                        var resId = await cmd.ExecuteScalarAsync();
                        carId = resId != null ? Convert.ToInt32(resId) : 0;
                    }

                    foreach (var d in req.Dotari)
                    {
                        using (OleDbCommand cmdD = new OleDbCommand("INSERT INTO Autovehicul_dotari (ID_Autovehicul, ID_Dotare) VALUES (?,?)", conn, tx))
                        {
                            cmdD.Parameters.AddWithValue("?", carId);
                            cmdD.Parameters.AddWithValue("?", int.Parse(d));
                            await cmdD.ExecuteNonQueryAsync();
                        }
                    }

                    foreach (var c in req.Conditii)
                    {
                        using (OleDbCommand cmdC = new OleDbCommand("INSERT INTO Autovehicul_conditii (ID_Autovehicul, ID_Conditie) VALUES (?,?)", conn, tx))
                        {
                            cmdC.Parameters.AddWithValue("?", carId);
                            cmdC.Parameters.AddWithValue("?", int.Parse(c));
                            await cmdC.ExecuteNonQueryAsync();
                        }
                    }

                    tx.Commit();
                    return Ok(new { id = carId });
                }
                catch
                {
                    tx.Rollback();
                    throw;
                }
            }
        }
    }

    [HttpPut("modificare/{id}")]
    public async Task<IActionResult> ModificaMasina(int id, [FromBody] Masina req)
    {
        using (OleDbConnection conn = new OleDbConnection(_connectionString))
        {
            await conn.OpenAsync();
            using (OleDbTransaction tx = conn.BeginTransaction())
            {
                try
                {
                    string sql = "UPDATE Autovehicule SET Model=?, Numar_Inmatriculare=?, AnFabricatie=?, Tarif_Inchiriere=?, Poza=?, Motorizare=?, Descriere=? WHERE ID_Autovehicul=?";
                    using (OleDbCommand cmd = new OleDbCommand(sql, conn, tx))
                    {
                        cmd.Parameters.AddWithValue("?", req.Model);
                        cmd.Parameters.AddWithValue("?", req.Numar_Inmatriculare);
                        cmd.Parameters.AddWithValue("?", req.An);
                        cmd.Parameters.AddWithValue("?", req.Pret);
                        cmd.Parameters.AddWithValue("?", req.Img);
                        cmd.Parameters.AddWithValue("?", req.Motorizare);
                        cmd.Parameters.AddWithValue("?", req.Descriere);
                        cmd.Parameters.AddWithValue("?", id);
                        await cmd.ExecuteNonQueryAsync();
                    }

                    await SincronizeazaRelatii(conn, tx, id, "Autovehicul_dotari", "ID_Dotare", req.Dotari);
                    await SincronizeazaRelatii(conn, tx, id, "Autovehicul_conditii", "ID_Conditie", req.Conditii);

                    tx.Commit();
                    return Ok();
                }
                catch (Exception ex)
                {
                    tx.Rollback();
                    return StatusCode(500, $"Eroare la salvare: {ex.Message}");
                }
            }
        }
    }

    private async Task SincronizeazaRelatii(OleDbConnection conn, OleDbTransaction tx, int masinaId, string tabel, string coloanaId, List<string> elementeNoi)
    {
        List<string> existente = new List<string>();
        string sqlSelect = $"SELECT {coloanaId} FROM {tabel} WHERE ID_Autovehicul = ?";
        
        using (OleDbCommand cmd = new OleDbCommand(sqlSelect, conn, tx))
        {
            cmd.Parameters.AddWithValue("?", masinaId);
            using (var r = await cmd.ExecuteReaderAsync())
            {
                while (r.Read())
                {
                    string? val = r[0]?.ToString();
                    if (val != null)
                    {
                        existente.Add(val);
                    }
                }
            }
        }
        var deSters = existente.Except(elementeNoi).ToList();
        foreach (var idElem in deSters)
        {
            string sqlDelete = $"DELETE FROM {tabel} WHERE ID_Autovehicul = ? AND {coloanaId} = ?";
            using (OleDbCommand cmd = new OleDbCommand(sqlDelete, conn, tx))
            {
                cmd.Parameters.AddWithValue("?", masinaId);
                cmd.Parameters.AddWithValue("?", int.Parse(idElem));
                await cmd.ExecuteNonQueryAsync();
            }
        }
        var deAdaugat = elementeNoi.Except(existente).ToList();
        foreach (var idElem in deAdaugat)
        {
            string sqlInsert = $"INSERT INTO {tabel} (ID_Autovehicul, {coloanaId}) VALUES (?, ?)";
            using (OleDbCommand cmd = new OleDbCommand(sqlInsert, conn, tx))
            {
                cmd.Parameters.AddWithValue("?", masinaId);
                cmd.Parameters.AddWithValue("?", int.Parse(idElem));
                await cmd.ExecuteNonQueryAsync();
            }
        }
    }
    [HttpDelete("stergere/{id}")]
public async Task<IActionResult> StergeMasina(int id)
{
    var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    
    using (OleDbConnection conn = new OleDbConnection(_connectionString))
    {
        await conn.OpenAsync();
        string sqlCheck = "SELECT EsteAdmin FROM Users WHERE ID = ?";
        using (OleDbCommand cmdCheck = new OleDbCommand(sqlCheck, conn))
        {
            cmdCheck.Parameters.AddWithValue("?", userId);
            bool isAdmin = Convert.ToBoolean(await cmdCheck.ExecuteScalarAsync() ?? false);
            
            if (!isAdmin) return Forbid();
        }

        string sqlDelete = "DELETE FROM Autovehicule WHERE ID_Autovehicul = ?";
        using (OleDbCommand cmdDel = new OleDbCommand(sqlDelete, conn))
        {
            cmdDel.Parameters.AddWithValue("?", id);
            await cmdDel.ExecuteNonQueryAsync();
        }
    }
    return Ok();
    }
}
