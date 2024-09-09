using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MyMicroservice.Models;
using MyMicroservice.Services;
using JsonSerializer = System.Text.Json.JsonSerializer;

namespace MyMicroservice.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReturnsController : ControllerBase
    {
        private readonly IReturnService _returnService;
        private readonly HttpClient _httpClient;

        public ReturnsController(IReturnService returnService, IHttpClientFactory httpClientFactory)
        {
            _returnService = returnService;
            _httpClient = httpClientFactory.CreateClient();
        }

        [HttpPost]
        public async Task<IActionResult> Post([FromBody] ReturnInitiationRequest request)
        {
            // Make HTTP request to fetch order details
            var order = await FetchOrder(request.Uid);
            if (order == null)
            {
                return NotFound("Order not found");
            }

            if (order.OrderId == request.OrderId)
            {
                // Create new Return object
                var newReturn = new Return { OrderId = order.OrderId, Status = "0" };

                // Initiate return in the service
                var createdReturn = _returnService.InitiateReturn(newReturn);

                // Return response with Created status and location header
                return CreatedAtAction(nameof(GetById), new { id = createdReturn.ReturnId }, createdReturn);
            }

            return NotFound();
        }

        private async Task<Order> FetchOrder(int uid)
        {
            try
            {
                var orderRequest = new OrderRequest { Uid = uid };

                var requestContent = new StringContent(JsonSerializer.Serialize(orderRequest), System.Text.Encoding.UTF8, "application/json");

                using var requestMessage = new HttpRequestMessage(HttpMethod.Get, "http://localhost:3502/api/v1/order")
                {
                    Content = requestContent
                };

                using var response = await _httpClient.SendAsync(requestMessage);

                if (response.IsSuccessStatusCode)
                {
                    var responseBody = await response.Content.ReadAsStringAsync();
                    Console.WriteLine($"Response Body: {responseBody}"); // Log response body for debugging

                    var options = new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    };

                    // Deserialize the response body into a list of Order objects
                    var orders = JsonSerializer.Deserialize<List<Order>>(responseBody, options);

                    return orders?.FirstOrDefault();
                }

                return null;
            }
            catch (Exception ex)
            {
                // Log or handle exception as needed
                Console.WriteLine($"Error fetching order: {ex.Message}");
                return null;
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var returnItem = _returnService.GetReturnById(id);
            if (returnItem == null)
            {
                return NotFound();
            }
            return Ok(returnItem);
        }

        [HttpPut("{id}/status")]
        public IActionResult UpdateStatus(int id, [FromBody] UpdateStatusRequest request)
        {
            var isUpdated = _returnService.UpdateReturnStatus(id, request.NewStatus);
            if (!isUpdated)
            {
                return NotFound();
            }

            return Ok();
        }
    }
}
