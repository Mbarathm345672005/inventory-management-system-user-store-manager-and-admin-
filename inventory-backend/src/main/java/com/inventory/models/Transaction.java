package com.inventory.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;
    private String productId;       // Which product was changed
    private String productName;     // Name of the product (for easy display)
    private String type;            // "STOCK-IN" or "STOCK-OUT"
    private int quantity;           // How many items
    private String handledBy;       // Email of the admin/manager who did it
    private LocalDateTime timestamp;  // When it happened
}