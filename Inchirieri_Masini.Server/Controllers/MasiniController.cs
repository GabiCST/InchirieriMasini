using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Runtime.Versioning;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[SupportedOSPlatform("windows")]
public class MasiniController : ControllerBase
{
    private readonly string _connectionString;

    public MasiniController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("ServiceDb") 
            ?? throw new InvalidOperationException("Connection string 'ServiceDb' not found.");
    }

    [HttpGet]
public IActionResult GetMasini()
{
    var listaMasini = new List<Masina>();

    using (OleDbConnection conn = new OleDbConnection(_connectionString))
    {
        conn.Open();

        string sql = "SELECT ID_Autovehicul, Model, AnFabricatie, Numar_Matriculare, Tarif_Inchiriere, Poza, Motorizare FROM Autovehicule";

        using (OleDbCommand cmd = new OleDbCommand(sql, conn))
        using (OleDbDataReader reader = cmd.ExecuteReader())
        {
            while (reader.Read())
            {
                listaMasini.Add(new Masina {
                    Id = Convert.ToInt32(reader["ID_Autovehicul"]),
                    Model = reader["Model"]?.ToString() ?? "",
                    An = Convert.ToInt32(reader["AnFabricatie"]),
                    Numar_Inmatriculare = reader["Numar_Matriculare"]?.ToString() ?? "",
                    Pret = Convert.ToDecimal(reader["Tarif_Inchiriere"]),
                    Img = reader["Poza"]?.ToString() ?? "",
                    Motorizare = reader["Motorizare"]?.ToString() ?? ""
                });
            }
        }
    }
    return Ok(listaMasini);
}
}