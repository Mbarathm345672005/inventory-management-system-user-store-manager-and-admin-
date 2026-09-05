package com.inventory.payload;

import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String id;
    private String email;
    private String role;
    private boolean validated;

    public JwtResponse(String accessToken, String id, String email, String role, boolean validated) {
        this.token = accessToken;
        this.id = id;
        this.email = email;
        this.role = role;
        this.validated = validated;
    }
}