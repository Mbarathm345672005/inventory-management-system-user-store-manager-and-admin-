package com.inventory.models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String message;
    private String type; // "LOW_STOCK", "EXPIRY", "VENDOR"
    private boolean isRead; // To track if admin saw it
    private LocalDateTime createdAt;
    private String productId;
    
}