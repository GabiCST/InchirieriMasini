public class DatePersonaleProfileRequest
{
    public string Nume { get; set; } = null!; 
    public string Prenume { get; set; } = null!;
    public string Telefon { get; set; } = null!;
}
public class DatePersonaleRequest : DatePersonaleProfileRequest
{
    public string? CI { get; set; }
    public string? Adresa { get; set; }
    public string? Serie_carnet { get; set; }
    public DateTime? Data_expirare { get; set; }
}