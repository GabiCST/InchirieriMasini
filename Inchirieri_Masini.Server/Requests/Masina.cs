public class Masina {
    public int Id { get; set; }
    public string Model { get; set; } = null!;
    public int An { get; set; }
    public string Numar_Inmatriculare { get; set; } = null!;
    public int Pret { get; set; }
    public string Img { get; set; } = null!;
    public string Motorizare { get; set; } = null!;
    public string Descriere { get; set; } = null!;
    public List<string> Dotari { get; set; } = new List<string>();
    public List<string> Conditii { get; set; } = new List<string>();
    public List<EvenimentRequest> Evenimente { get; set; } = new List<EvenimentRequest>();
}