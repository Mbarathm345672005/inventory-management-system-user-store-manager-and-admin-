package com.inventory.controllers;

import com.inventory.models.Product;
import com.inventory.models.Transaction;
import com.inventory.payload.AnalyticsDTO;
import com.inventory.repositories.ProductRepository;
import com.inventory.repositories.TransactionRepository;
import com.inventory.services.ReportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/analytics")
@PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
public class AnalyticsController {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private ReportService reportService;

    // ... (Keep getAnalyticsSummary & exportExcel exactly as they are) ...
    @GetMapping("/summary")
    public ResponseEntity<AnalyticsDTO> getAnalyticsSummary() {
        AnalyticsDTO dto = new AnalyticsDTO();
        LocalDateTime now = LocalDateTime.now();
        List<Transaction> salesToday = transactionRepository.findByTypeAndTimestampBetween("SALE", now.with(LocalTime.MIN), now.with(LocalTime.MAX));
        List<Transaction> salesMonth = transactionRepository.findByTypeAndTimestampBetween("SALE", now.withDayOfMonth(1).with(LocalTime.MIN), now.with(LocalTime.MAX));

        dto.setOrdersToday(salesToday.size());
        dto.setOrdersMonth(salesMonth.size());
        dto.setRevenueToday(calculateRevenue(salesToday));
        dto.setRevenueMonth(calculateRevenue(salesMonth));
        return ResponseEntity.ok(dto);
    }
    
    @GetMapping("/export/excel")
    public ResponseEntity<InputStreamResource> exportExcel() throws IOException {
        ByteArrayInputStream in = reportService.generateExcelReport();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=inventory_report.xlsx");
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(in));
    }

    // --- REVENUE TRENDS (Dynamic) ---
    @GetMapping("/trends")
    public ResponseEntity<Map<String, Object>> getTrends(@RequestParam(defaultValue = "monthly") String period) {
        List<String> labels = new ArrayList<>();
        List<Double> data = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        int iterations = 0;
        DateTimeFormatter formatter = null;

        if (period.equals("daily")) {
            iterations = 7;
            formatter = DateTimeFormatter.ofPattern("dd MMM");
        } else if (period.equals("weekly")) {
            iterations = 5;
            formatter = DateTimeFormatter.ofPattern("dd MMM"); 
        } else {
            iterations = 6;
            formatter = DateTimeFormatter.ofPattern("MMM yyyy");
        }

        for (int i = iterations - 1; i >= 0; i--) {
            LocalDateTime start, end;
            String label;

            if (period.equals("daily")) {
                LocalDateTime day = now.minusDays(i);
                start = day.with(LocalTime.MIN);
                end = day.with(LocalTime.MAX);
                label = day.format(formatter);
            } else if (period.equals("weekly")) {
                LocalDateTime weekStart = now.minusWeeks(i).with(DayOfWeek.MONDAY);
                start = weekStart.with(LocalTime.MIN);
                end = weekStart.plusDays(6).with(LocalTime.MAX);
                label = start.format(formatter); 
            } else {
                LocalDateTime month = now.minusMonths(i);
                start = month.withDayOfMonth(1).with(LocalTime.MIN);
                end = month.with(TemporalAdjusters.lastDayOfMonth()).with(LocalTime.MAX);
                label = month.format(formatter);
            }

            labels.add(label);
            List<Transaction> sales = transactionRepository.findByTypeAndTimestampBetween("SALE", start, end);
            data.add(calculateRevenue(sales));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("labels", labels);
        response.put("data", data);
        return ResponseEntity.ok(response);
    }

    // --- UPDATED: TOP SELLING (Supports "all" for All-Time) ---
   @GetMapping("/top-selling")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER') or hasRole('USER')")
    public ResponseEntity<List<Product>> getTopSelling(@RequestParam(defaultValue = "all") String period) {
        List<Transaction> sales;
        LocalDateTime now = LocalDateTime.now();

        // 1. Fetch Sales based on Period
        if (period.equals("all")) {
            sales = transactionRepository.findByType("SALE");
        } else {
            LocalDateTime start;
            LocalDateTime end = now.with(LocalTime.MAX);
            if (period.equals("daily")) start = now.with(LocalTime.MIN);
            else if (period.equals("weekly")) start = now.minusWeeks(1).with(LocalTime.MIN);
            else start = now.withDayOfMonth(1).with(LocalTime.MIN);
            
            sales = transactionRepository.findByTypeAndTimestampBetween("SALE", start, end);
        }

        // 2. Count Qty per Product
        Map<String, Integer> salesCount = sales.stream()
            .collect(Collectors.groupingBy(
                Transaction::getProductId,
                Collectors.summingInt(Transaction::getQuantity)
            ));

        // 3. Get Top IDs (Sorted by sales)
        List<String> topIds = salesCount.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // 4. Fetch the actual Product objects
        List<Product> finalProductList = new ArrayList<>();
        for(String id : topIds) {
            productRepository.findById(id).ifPresent(finalProductList::add);
        }

        // --- NEW LOGIC: FILL UP TO 5 PRODUCTS IF NEEDED ---
        if (finalProductList.size() < 5) {
            // Fetch all products to find fillers
            List<Product> allProducts = productRepository.findAll();
            
            for (Product p : allProducts) {
                if (finalProductList.size() >= 5) break; // Stop if we have 5
                
                // Add product ONLY if it's not already in the list
                if (finalProductList.stream().noneMatch(existing -> existing.getId().equals(p.getId()))) {
                    finalProductList.add(p);
                }
            }
        }

        return ResponseEntity.ok(finalProductList);
    }

    private double calculateRevenue(List<Transaction> transactions) {
        double total = 0;
        for (Transaction tx : transactions) {
            Product p = productRepository.findById(tx.getProductId()).orElse(null);
            if (p != null) {
                total += (p.getPrice() * tx.getQuantity());
            }
        }
        return total;
    }
}