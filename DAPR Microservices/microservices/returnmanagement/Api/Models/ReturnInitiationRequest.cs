using Newtonsoft.Json;

namespace MyMicroservice.Models;

public class ReturnInitiationRequest
{
    [JsonProperty("uid")]
    public int Uid { get; set; }

    [JsonProperty("order_id")]
    public int OrderId { get; set; }
}
