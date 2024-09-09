using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Dapr.Client;
using Microsoft.AspNetCore.Mvc;
using MyMicroservice.Models;
using MyMicroservice.Services;

namespace MyMicroservice.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ReturnsController : ControllerBase
    {
        private readonly IReturnService _returnService;

        public ReturnsController(IReturnService returnService)
        {
            _returnService = returnService;
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
                var _daprClient = new DaprClientBuilder().Build();
                var orderRequest = new OrderRequest { Uid = uid };

                var response = await _daprClient.InvokeMethodAsync<OrderRequest, List<Order>>(
                    HttpMethod.Get,
                    "ordermanagement",
                    "/order",
                    orderRequest
                );

                return response?.FirstOrDefault();
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