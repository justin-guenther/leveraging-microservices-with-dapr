using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MyMicroservice.Models
{
    public class Return
    {
        [Key]
        [Column("return_id")]
        public int ReturnId { get; set; }

        [Column("order_id")]
        public int OrderId { get; set; }

        [Column("status")]
        public string Status { get; set; }

        [Column("requested_at")]
        public DateTime RequestedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }
    }
}
