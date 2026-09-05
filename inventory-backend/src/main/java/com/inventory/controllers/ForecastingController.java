package com.inventory.controllers;

import com.inventory.models.Product;
import com.inventory.payload.ForecastDTO;
import com.inventory.repositories.ProductRepository;
import com.inventory.services.ReportService; // <--- Import ReportService
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

// <--- 2. Add this annotation to allow React (port 3000) to access this controller
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/forecast")
@PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
public class ForecastingController {

    @Autowired
    private ProductRepository productRepository;
@Autowired
    private ReportService reportService;
    // This is the URL of your Python AI service
    private final String PYTHON_SERVICE_URL = "http://localhost:5000/forecast";

    @GetMapping
    public ResponseEntity<List<ForecastDTO>> getFullForecast() {
        
        List<Product> products = productRepository.findAll();
        List<ForecastDTO> forecasts = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate(); 

        for (Product product : products) {
            try {
                // 1. Call the Python AI service
                Map<String, String> requestBody = Map.of("productId", product.getId());
                
                // Ensure Python service is running on port 5000!
                Map<String, Object> aiResponse = restTemplate.postForObject(PYTHON_SERVICE_URL, requestBody, Map.class);
                
                int forecastDemand = (int) aiResponse.get("total_forecast");
                List<Map<String, Object>> trendData = (List<Map<String, Object>>) aiResponse.get("trend_data");

                // 2. Combine data
                ForecastDTO dto = new ForecastDTO();
                dto.setProductId(product.getId());
                dto.setProductName(product.getName());
                dto.setCurrentStock(product.getQuantity());
                dto.setForecastNext7Days(forecastDemand);
                dto.setTrendData(trendData);

                // 3. Highlight products at risk
                if (product.getQuantity() == 0) {
                    dto.setAction("STOCKOUT");
                } else if (product.getQuantity() < forecastDemand) {
                    dto.setAction("WARNING - Risk of Stockout");
                } else {
                    dto.setAction("OK");
                }
                
                forecasts.add(dto);

            } catch (Exception e) {
                System.err.println("Error forecasting product " + product.getId() + ": " + e.getMessage());
                // Create a DTO with error info
                ForecastDTO errorDto = new ForecastDTO();
                errorDto.setProductId(product.getId());
                errorDto.setProductName(product.getName());
                errorDto.setCurrentStock(product.getQuantity());
                errorDto.setForecastNext7Days(0);
                errorDto.setAction("ERROR - Forecast Failed");
                errorDto.setTrendData(new ArrayList<>());
                forecasts.add(errorDto);
            }
        }
        
        return ResponseEntity.ok(forecasts);
    }
    @GetMapping("/export")
    public ResponseEntity<Resource> exportForecast() {
        try {
            // 1. REUSE LOGIC: Fetch fresh forecast data from Python
            // (Ideally, extract this fetch logic into a separate helper method to avoid duplicate code)
            List<ForecastDTO> forecasts = fetchForecastDataInternal(); 

            // 2. Generate Excel
            InputStreamResource file = new InputStreamResource(reportService.generateForecastReport(forecasts));
            String filename = "Demand_Forecast_Report.xlsx";

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(file);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // --- Helper Method to avoid copying the whole Python loop ---
    private List<ForecastDTO> fetchForecastDataInternal() {
        List<Product> products = productRepository.findAll();
        List<ForecastDTO> forecasts = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();

        for (Product product : products) {
            try {
                Map<String, String> requestBody = Map.of("productId", product.getId());
                Map<String, Object> aiResponse = restTemplate.postForObject(PYTHON_SERVICE_URL, requestBody, Map.class);
                
                int forecastDemand = (int) aiResponse.get("total_forecast");
                // We don't strictly need trendData for the Excel summary, but good to have
                List<Map<String, Object>> trendData = (List<Map<String, Object>>) aiResponse.get("trend_data");

                ForecastDTO dto = new ForecastDTO();
                dto.setProductId(product.getId());
                dto.setProductName(product.getName());
                dto.setCurrentStock(product.getQuantity());
                dto.setForecastNext7Days(forecastDemand);
                dto.setTrendData(trendData);

                if (product.getQuantity() == 0) dto.setAction("STOCKOUT");
                else if (product.getQuantity() < forecastDemand) dto.setAction("WARNING - Risk of Stockout");
                else dto.setAction("OK");
                
                forecasts.add(dto);
            } catch (Exception e) {
                // Handle errors silently for export or add error DTO
                System.err.println("Export error for product: " + product.getName());
            }
        }
        return forecasts;
    }
}