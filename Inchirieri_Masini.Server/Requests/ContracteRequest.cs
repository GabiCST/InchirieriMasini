public class ContracteRequest
{
    public int ID_Client { get; set; }
    public int Id_Autovehicul { get; set; }
    public DateTime Data_Intocmiri { get; set; }
    public DateTime Data_Inchiriere { get; set; }
    public DateTime Data_Returnare { get; set; }
    public string Status_Contract { get; set; } = null!;
    public int Suma_Totala_Estimata { get; set; }
}