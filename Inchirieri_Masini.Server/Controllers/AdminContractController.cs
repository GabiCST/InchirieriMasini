using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Data.OleDb;
using System.Runtime.Versioning;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

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

    [HttpGet("proces-verbal-pdf/{id}")]
    public IActionResult GenerareProcesVerbalPdf(int id)
    {
        byte[] pdfBytes;
        string numeAdmin = User.Identity?.Name ?? "Administrator Sistem";

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
           
            string query = @"SELECT c.ID_Contract, c.Data_Intocmiri, c.Avans, c.Suma_Totala_Estimata, 
                                    u.Nume_Prenume, a.Model
                            FROM ((Contracte c
                            INNER JOIN Users u ON c.ID_Client = u.ID)
                            INNER JOIN Autovehicule a ON c.Id_Autovehicul = a.ID_Autovehicul)
                            WHERE c.ID_Contract = ?";

            OleDbCommand command = new OleDbCommand(query, connection);
            command.Parameters.Add("?", OleDbType.Integer).Value = id;
            connection.Open();

            using (OleDbDataReader reader = command.ExecuteReader())
            {
                if (!reader.Read()) return NotFound();

                double sumaTotala = reader["Suma_Totala_Estimata"] != DBNull.Value ? Convert.ToDouble(reader["Suma_Totala_Estimata"]) : 0;
                double avans = reader["Avans"] != DBNull.Value ? Convert.ToDouble(reader["Avans"]) : 0;
                double restDePlata = sumaTotala - avans; 

                string client = reader["Nume_Prenume"]?.ToString() ?? "N/A";
                string auto = reader["Model"]?.ToString() ?? "N/A";
                DateTime dataContract = reader["Data_Intocmiri"] != DBNull.Value ? Convert.ToDateTime(reader["Data_Intocmiri"]) : DateTime.Now;

                QuestPDF.Settings.License = LicenseType.Community;
                var document = Document.Create(container =>
                {
                    container.Page(page =>
                    {
                        page.Size(PageSizes.A4);
                        page.Margin(2, Unit.Centimetre);

                        page.Header().Text("PROCES VERBAL DE PREDARE").FontSize(20).Bold().FontColor(Colors.Blue.Medium);

                        page.Content().PaddingTop(20).Column(col =>
                        {
                            col.Spacing(8);
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Contract:").Bold();
                                row.RelativeItem().Text($"#{id}");
                            });
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Data Document:").Bold();
                                row.RelativeItem().Text($"{dataContract:dd.MM.yyyy}");
                            });
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Client:").Bold();
                                row.RelativeItem().Text(client);
                            });
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Autovehicul:").Bold();
                                row.RelativeItem().Text(auto);
                            });

                            col.Item().PaddingVertical(10).LineHorizontal(1).LineColor(Colors.Grey.Lighten2);
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Avans încasat:").Bold();
                                row.RelativeItem().Text($"{avans} EUR").FontColor(Colors.Green.Medium).Bold();
                            });
                            col.Item().Row(row => {
                                row.RelativeItem().Text("Rest de plată (fără penalizări):").Bold();
                                row.RelativeItem().Text($"{restDePlata} EUR").Bold();
                            });
                            col.Item().PaddingTop(40).Text(t => {
                                t.Span("Document generat de administrator: ").Italic();
                                t.Span(numeAdmin).Bold();
                            });
                        });

                        page.Footer().AlignCenter().Text(x => {
                            x.Span("Pagina ");
                            x.CurrentPageNumber();
                        });
                    });
                });
                pdfBytes = document.GeneratePdf();
            }
        }
        return File(pdfBytes, "application/pdf", $"ProcesVerbal_{id}.pdf");
    }

   [HttpGet("proces-verbal-primire-pdf/{id}")]
    public IActionResult GenerareProcesVerbalPrimirePdf(int id)
    {
        byte[] pdfBytes;
        string numePrenumeAdmin = "Administrator";
        string? currentUsername = User.Identity?.Name;

        using (OleDbConnection connection = new OleDbConnection(_connectionString))
        {
            connection.Open();

            if (!string.IsNullOrEmpty(currentUsername))
            {
                string adminQuery = "SELECT Nume_Prenume FROM Users WHERE Username = ?";
                using (OleDbCommand adminCmd = new OleDbCommand(adminQuery, connection))
                {
                    adminCmd.Parameters.Add("?", OleDbType.VarWChar).Value = currentUsername;
                    var result = adminCmd.ExecuteScalar();
                    if (result != null) numePrenumeAdmin = result.ToString() ?? "Administrator";
                }
            }

            string query = @"SELECT c.ID_Contract, c.Data_Intocmiri, c.Avans, c.Suma_Totala_Estimata, 
                                    u.Nume_Prenume AS NumeClient, a.Model, 
                                    f.Suma_Penalizare, f.Rest, f.Observatii_Returnare
                            FROM ((Contracte c
                            INNER JOIN Users u ON c.ID_Client = u.ID)
                            INNER JOIN Autovehicule a ON c.Id_Autovehicul = a.ID_Autovehicul)
                            LEFT JOIN FinalizareContract f ON c.ID_Contract = f.ID_Contract
                            WHERE c.ID_Contract = ?";

            using (OleDbCommand command = new OleDbCommand(query, connection))
            {
                command.Parameters.Add("?", OleDbType.Integer).Value = id;
                using (OleDbDataReader reader = command.ExecuteReader())
                {
                    if (!reader.Read()) return NotFound();

                    double sumaEstimata = reader["Suma_Totala_Estimata"] != DBNull.Value ? Convert.ToDouble(reader["Suma_Totala_Estimata"]) : 0;
                    double avans = reader["Avans"] != DBNull.Value ? Convert.ToDouble(reader["Avans"]) : 0;
                    double penalizare = reader["Suma_Penalizare"] != DBNull.Value ? Convert.ToDouble(reader["Suma_Penalizare"]) : 0;
                    double restPlata = reader["Rest"] != DBNull.Value ? Convert.ToDouble(reader["Rest"]) : (sumaEstimata - avans);
                    
                    double totalDePlatit = restPlata + penalizare;
                    double totalGeneral = avans + restPlata + penalizare;

                    string client = reader["NumeClient"]?.ToString() ?? "N/A";
                    string modelAuto = reader["Model"]?.ToString() ?? "N/A";
                    string observatii = reader["Observatii_Returnare"]?.ToString() ?? "N/A";
                    DateTime dataDoc = reader["Data_Intocmiri"] != DBNull.Value ? Convert.ToDateTime(reader["Data_Intocmiri"]) : DateTime.Now;

                    QuestPDF.Settings.License = LicenseType.Community;
                    var document = Document.Create(container =>
                    {
                        container.Page(page =>
                        {
                            page.Size(PageSizes.A4);
                            page.Margin(1.5f, Unit.Centimetre);
                            
                            page.Header().Row(row => {
                                row.RelativeItem().Column(col => {
                                    col.Item().Text("PROCES VERBAL DE PRIMIRE").FontSize(22).Bold().FontColor(Colors.Blue.Medium);
                                    col.Item().Text($"Contract nr: #{id}").FontSize(12);
                                });
                                row.RelativeItem().AlignRight().Text(DateTime.Now.ToString("dd.MM.yyyy")).FontSize(10);
                            });

                            page.Content().PaddingTop(20).Column(col =>
                            {
                                col.Item().Text(t => { t.Span("Client: ").Bold(); t.Span(client); });
                                col.Item().Text(t => { t.Span("Autovehicul: ").Bold(); t.Span(modelAuto); });
                                col.Item().Text(t => { t.Span("Data Contract: ").Bold(); t.Span(dataDoc.ToString("dd.MM.yyyy")); });

                                col.Item().PaddingTop(20).Table(table =>
                                {
                                    table.ColumnsDefinition(columns => {
                                        columns.RelativeColumn();
                                        columns.ConstantColumn(120);
                                    });

                                    table.Cell().BorderBottom(1).PaddingVertical(5).Text("Suma Contractuala");
                                    table.Cell().BorderBottom(1).PaddingVertical(5).AlignRight().Text($"{sumaEstimata} EUR");

                                    table.Cell().BorderBottom(1).PaddingVertical(5).Text("Avans Incasat");
                                    table.Cell().BorderBottom(1).PaddingVertical(5).AlignRight().Text($"{avans} EUR");

                                    table.Cell().BorderBottom(1).PaddingVertical(5).Text("Rest de Plata");
                                    table.Cell().BorderBottom(1).PaddingVertical(5).AlignRight().Text($"{restPlata} EUR");

                                    table.Cell().BorderBottom(1).PaddingVertical(5).Text("Suma Penalizare");
                                    table.Cell().BorderBottom(1).PaddingVertical(5).AlignRight().Text($"{penalizare} EUR");

                                    table.Cell().PaddingVertical(10).Text("TOTAL DE PLATIT (Rest + Penalizari)").Bold();
                                    table.Cell().PaddingVertical(10).AlignRight().Text($"{totalDePlatit} EUR").Bold().FontColor(Colors.Red.Medium);

                                    table.Cell().Background(Colors.Grey.Lighten3).Padding(8).Text("TOTAL GENERAL CONTRACT").Bold();
                                    table.Cell().Background(Colors.Grey.Lighten3).Padding(8).AlignRight().Text($"{totalGeneral} EUR").Bold().FontSize(14);
                                });

                                col.Item().PaddingTop(30).Column(obsCol => {
                                    obsCol.Item().Text("Observatii Returnare:").Bold();
                                    obsCol.Item().Border(0.5f).Padding(10).Text(observatii).Italic();
                                });

                                col.Item().PaddingTop(40).Row(row => {
                                    row.RelativeItem().AlignRight().Column(adminCol => {
                                        adminCol.Item().AlignRight().Text("Administrator:").FontSize(10).Italic();
                                        adminCol.Item().AlignRight().Text(numePrenumeAdmin).Bold();
                                        adminCol.Item().PaddingTop(10).AlignRight().Text("__________________________");
                                        adminCol.Item().AlignRight().Text("Semnatura");
                                    });
                                });
                            });

                            page.Footer().AlignCenter().Text(x => {
                                x.Span("Pagina ");
                                x.CurrentPageNumber();
                            });
                        });
                    });
                    pdfBytes = document.GeneratePdf();
                }
            }
        }
        return File(pdfBytes, "application/pdf", $"ProcesVerbal_Primire_{id}.pdf");
    }
}