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
public class DetaliiMasinaController : ControllerBase
{
    private readonly string _connectionString;
    private readonly IConfiguration _configuration;

    public DetaliiMasinaController(IConfiguration configuration)
    {
        _configuration = configuration;
        _connectionString = configuration.GetConnectionString("ServiceDb") ?? throw new InvalidOperationException("Connection string not found.");
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetDetaliiMasina(int id)
    {
        var masina = new Masina();

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            await connection.OpenAsync();

            string sqlMasina = @"
                SELECT a.ID_Autovehicul, a.Model, a.Numar_Inmatriculare, a.AnFabricatie, 
                    a.Tarif_Inchiriere, a.Poza, a.Motorizare, a.Descriere,
                    d.Dotare, c.Conditie
                FROM (((Autovehicule AS a
                LEFT JOIN Autovehicul_dotari AS ad ON a.ID_Autovehicul = ad.ID_Autovehicul)
                LEFT JOIN Dotari AS d ON ad.ID_Dotare = d.ID_Dotare)
                LEFT JOIN Autovehicul_conditii AS ac ON a.ID_Autovehicul = ac.ID_Autovehicul)
                LEFT JOIN Conditii AS c ON ac.ID_Conditie = c.ID_Conditie
                WHERE a.ID_Autovehicul = ?";

            using (OleDbCommand cmd = new OleDbCommand(sqlMasina, connection))
            {
                cmd.Parameters.AddWithValue("?", id);
                using (OleDbDataReader reader = (OleDbDataReader)await cmd.ExecuteReaderAsync())
                {
                    bool dateMasinaSetate = false;
                    while (reader.Read())
                    {
                        if (!dateMasinaSetate)
                        {
                            masina.Id = Convert.ToInt32(reader["ID_Autovehicul"]);
                            masina.Model = reader["Model"]?.ToString() ?? "";
                            masina.Numar_Inmatriculare = reader["Numar_Inmatriculare"]?.ToString() ?? "";
                            masina.An = Convert.ToInt32(reader["AnFabricatie"]);
                            masina.Pret = Convert.ToInt32(reader["Tarif_Inchiriere"]);
                            masina.Motorizare = reader["Motorizare"]?.ToString() ?? "";
                            masina.Img = reader["Poza"]?.ToString() ?? "";
                            masina.Descriere = reader["Descriere"]?.ToString() ?? "";
                            dateMasinaSetate = true;
                        }
                        string? dotare = reader["Dotare"]?.ToString();
                        if (!string.IsNullOrEmpty(dotare) && !masina.Dotari.Contains(dotare))
                            masina.Dotari.Add(dotare);

                        string? conditie = reader["Conditie"]?.ToString();
                        if (!string.IsNullOrEmpty(conditie) && !masina.Conditii.Contains(conditie))
                            masina.Conditii.Add(conditie);
                    }
                }
            }

            string sqlEvenimente = "SELECT Tip, Data_Eveniment, Locatie, Descriere, Costul_Reparatiei FROM Evenimente_Rutiere WHERE Id_autovehicul = ?";
            using (OleDbCommand cmdEv = new OleDbCommand(sqlEvenimente, connection))
            {
                cmdEv.Parameters.AddWithValue("?", id);
                using (OleDbDataReader readerEv = (OleDbDataReader)await cmdEv.ExecuteReaderAsync())
                {
                    while (readerEv.Read())
                    {
                        masina.Evenimente.Add(new EvenimentRequest {
                            Tip = readerEv["Tip"]?.ToString() ?? "Nespecificat",
                            Data_Eveniment = readerEv["Data_Eveniment"] != DBNull.Value ? Convert.ToDateTime(readerEv["Data_Eveniment"]) : DateTime.MinValue,
                            Locatie = readerEv["Locatie"]?.ToString() ?? "",
                            Descriere = readerEv["Descriere"]?.ToString() ?? "",
                            Costul_Reparatiei = readerEv["Costul_Reparatiei"] != DBNull.Value ? Convert.ToInt32(readerEv["Costul_Reparatiei"]) : 0
                        });
                    }
                }
            }
        }

        if (masina.Id == 0) return NotFound("Mașina nu a fost găsită.");
        return Ok(masina);
    }
}