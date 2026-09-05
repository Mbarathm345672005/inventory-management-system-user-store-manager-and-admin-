package com.inventory.payload;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
}