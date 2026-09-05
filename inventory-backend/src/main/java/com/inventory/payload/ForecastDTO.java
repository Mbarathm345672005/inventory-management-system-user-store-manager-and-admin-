package com.inventory.payload;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class ForecastDTO {
    private String productId;
    private String productName;
    private int currentStock;
    private int forecastNext7Days; // Forecasted demand
    private String action; // "OK", "WARNING", "STOCKOUT"
    private List<Map<String, Object>> trendData; // For the line chart
}