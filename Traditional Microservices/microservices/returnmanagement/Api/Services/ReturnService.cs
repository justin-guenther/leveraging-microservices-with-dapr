using System;
using System.Collections.Generic;
using System.Linq;
using MyMicroservice.Data;
using MyMicroservice.Models;

namespace MyMicroservice.Services
{
    public interface IReturnService
    {
        Return InitiateReturn(Return newReturn);
        Return GetReturnById(int id);
        bool UpdateReturnStatus(int id, string newStatus);
    }

    public class ReturnService : IReturnService
    {
        private readonly ApplicationDbContext _context;

        public ReturnService(ApplicationDbContext context)
        {
            _context = context;
        }

        public Return InitiateReturn(Return newReturn)
        {
            newReturn.RequestedAt = DateTime.UtcNow;
            _context.Returns.Add(newReturn);
            _context.SaveChanges();
            return newReturn;
        }

        public Return GetReturnById(int id)
        {
            return _context.Returns.Find(id);
        }

        public bool UpdateReturnStatus(int id, string newStatus)
        {
            var returnItem = _context.Returns.Find(id);
            if (returnItem == null) return false;

            returnItem.Status = newStatus;
            returnItem.UpdatedAt = DateTime.UtcNow.AddHours(2); // Time format isnt correct, we are 2 hours after
            _context.SaveChanges();
            return true;
        }
    }
}
