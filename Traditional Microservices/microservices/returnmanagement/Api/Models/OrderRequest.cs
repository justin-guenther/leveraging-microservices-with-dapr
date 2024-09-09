using System.Text.Json.Serialization;
using Newtonsoft.Json;

namespace MyMicroservice.Models;

public class OrderRequest
{
    [JsonPropertyName("uid")]
    public int Uid { get; set; }
}
