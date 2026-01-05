public class EvenimentRequest
{
    public int? ID_Eveniment { get; set; }
    public int Id_autovehicul { get; set; }
    public string Nume_Eveniment { get; set; } = null!;
    public string Tip { get; set; } = null!;
    public DateTime Data_Eveniment { get; set; }
    public string Locatie { get; set; } = null!;
    public string Descriere { get; set; } = null!;
    public int Costul_Reparatiei { get; set; }
}