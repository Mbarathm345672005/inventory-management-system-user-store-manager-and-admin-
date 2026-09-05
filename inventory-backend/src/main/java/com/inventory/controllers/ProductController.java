package com.inventory.controllers;

import com.inventory.models.Product;
import com.inventory.payload.MessageResponse; // Make sure this is imported

import com.inventory.models.Transaction;
import com.inventory.repositories.TransactionRepository;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.ArrayList;
import java.util.List;
import com.inventory.services.ReportService; // Import your service
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import com.inventory.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private ReportService reportService;

    // Admin & Store Manager: Create Product
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        Product savedProduct = productRepository.save(product);
        return ResponseEntity.ok(savedProduct);
    }

    // Admin, Store Manager & User: Get All Products
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Admin, Store Manager & User: Get Single Product
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable String id) {
        return productRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // Admin & Store Manager: Update Product
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<Product> updateProduct(@PathVariable String id, @RequestBody Product productDetails) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        Product product = optionalProduct.get();
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setQuantity(productDetails.getQuantity());
        product.setImageUrl(productDetails.getImageUrl());
        product.setPrice(productDetails.getPrice()); // Ensure price is updated
        
        Product updatedProduct = productRepository.save(product);
        return ResponseEntity.ok(updatedProduct);
    }

    // Admin & Store Manager: Delete Product
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable String id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Product deleted successfully!"));
    }

    @GetMapping("/top-selling")
    public ResponseEntity<List<Product>> getTopSellingProducts() {
        // 1. Find all "SALE" transactions
        List<Transaction> allSales = transactionRepository.findByType("SALE");

        // 2. Group them by productId and sum the quantity sold
        Map<String, Integer> salesByProduct = allSales.stream()
            .collect(Collectors.groupingBy(
                Transaction::getProductId,
                Collectors.summingInt(Transaction::getQuantity)
            ));

        // 3. Sort to find the top sellers
        List<String> topProductIds = salesByProduct.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .limit(5) // Get the top 5 products
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        // 4. Get the full Product details for those IDs
        List<Product> topProducts = new ArrayList<>();
        for (String id : topProductIds) {
             productRepository.findById(id).ifPresent(topProducts::add);
        }

        // 5. Return the list of products
        return ResponseEntity.ok(topProducts);
    }
   
    @GetMapping("/analytics/export") 
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
    public ResponseEntity<Resource> downloadReport() {
        String filename = "Stock_Transaction_Report.xlsx";
        
        try {
            // Call the generateExcelReport method from your ReportService
            InputStreamResource file = new InputStreamResource(reportService.generateExcelReport());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(file);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}