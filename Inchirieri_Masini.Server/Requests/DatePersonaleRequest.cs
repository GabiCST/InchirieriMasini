public class DatePersonaleProfileRequest
{
    public string Nume { get; set; } = null!; 
    public string Prenume { get; set; } = null!;
    public string Telefon { get; set; } = null!;
}
public class DatePersonaleRequest : DatePersonaleProfileRequest
{
    public string CI { get; set; } = null!;
    public string Adresa { get; set; } = null!;
    public string Serie_carnet { get; set; } = null!;
    public DateTime Data_expirare { get; set; }
}