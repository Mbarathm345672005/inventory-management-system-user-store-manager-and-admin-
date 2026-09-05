package com.inventory.payload;

import lombok.Data;

@Data
public class TopProductDTO {
    private String id;
    private String name;
    private String imageUrl;
    private String category;
    private double price;
    private int currentStock; // Inventory left
    private int soldCount;    // How many sold in the selected period
}