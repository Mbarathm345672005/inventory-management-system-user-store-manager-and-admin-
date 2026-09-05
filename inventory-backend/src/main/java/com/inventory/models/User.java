package com.inventory.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String name;
    private String dept;
    private String email;
    private String password;
    private String role; 
    private String phoneNo;
    private String warehouseLocation;
    private boolean validated; 
    private String resetToken;
    private LocalDateTime resetTokenExpiry;
    private List<CartItem> cart = new ArrayList<>();
}