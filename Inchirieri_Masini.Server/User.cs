public class User
{
    public int Id { get; set; }
    public string Nume { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string Password { get; set; } = null!;
    public DateTime DataCreare { get; set; } = DateTime.UtcNow;
}