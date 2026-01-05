public class FinalizareRequest
{
    public int ID_Contract { get; set; }
    public DateTime Data_Returnare_Efectiva { get; set; }
    public int Suma_Penalizare { get; set; }
    public int Rest { get; set; }
    public string MetodaPlataRest { get; set; } = null!;
    public string Observatii_Returnare { get; set; } = null!;
}