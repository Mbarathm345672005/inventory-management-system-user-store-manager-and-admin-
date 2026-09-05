package com.inventory.payload;

import lombok.Data;

@Data
public class SignUpRequest {
    private String name;
    private String dept;
    private String email;
    private String password;
    private String role;
    private String phoneNo;
    private String warehouseLocation;
}