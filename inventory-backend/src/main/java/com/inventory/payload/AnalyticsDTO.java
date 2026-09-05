package com.inventory.payload;

import lombok.Data;

@Data
public class AnalyticsDTO {
    private double revenueToday;
    private int ordersToday;
    private int ordersMonth;
    private double revenueMonth;
}