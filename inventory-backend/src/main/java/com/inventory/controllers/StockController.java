package com.inventory.controllers;

import com.inventory.models.Product;
import com.inventory.models.Transaction;
import com.inventory.repositories.ProductRepository;
import com.inventory.repositories.TransactionRepository; // You will need to create this
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/stock")
@PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')") // Secure the whole controller
public class StockController {

    @Autowired private ProductRepository productRepository;
    @Autowired private TransactionRepository transactionRepository; // Create this interface

    // --- Endpoint for STOCK-IN (Adding new items) ---
    @PostMapping("/in")
    public ResponseEntity<?> stockIn(@RequestBody Map<String, String> payload) {
        String productId = payload.get("productId");
        int quantity = Integer.parseInt(payload.get("quantity"));

        if (quantity <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be positive.");
        }

        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        // 1. Update Product
        Product product = optionalProduct.get();
        product.setQuantity(product.getQuantity() + quantity);
        productRepository.save(product);

        // 2. Log Transaction
        logTransaction(product, "STOCK-IN", quantity);
        
        return ResponseEntity.ok(product);
    }

    // --- Endpoint for STOCK-OUT (Manually removing items) ---
    @PostMapping("/out")
    public ResponseEntity<?> stockOut(@RequestBody Map<String, String> payload) {
        String productId = payload.get("productId");
        int quantity = Integer.parseInt(payload.get("quantity"));

        if (quantity <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be positive.");
        }

        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Product product = optionalProduct.get();
        if (product.getQuantity() < quantity) {
            return ResponseEntity.badRequest().body("Not enough stock to remove.");
        }

        // 1. Update Product
        product.setQuantity(product.getQuantity() - quantity);
        productRepository.save(product);

        // 2. Log Transaction
        logTransaction(product, "STOCK-OUT", quantity);

        return ResponseEntity.ok(product);
    }

    // --- Endpoint to GET Transaction History ---
    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getHistory() {
        // Find last 50, sorted by date
        return ResponseEntity.ok(transactionRepository.findTop50ByOrderByTimestampDesc()); 
    }

    // --- Helper function to log the transaction ---
    private void logTransaction(Product product, String type, int quantity) {
        // Get the email of the logged-in admin/manager
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String handledBy = auth.getName(); 

        Transaction tx = new Transaction();
        tx.setProductId(product.getId());
        tx.setProductName(product.getName());
        tx.setType(type);
        tx.setQuantity(quantity);
        tx.setHandledBy(handledBy);
        tx.setTimestamp(LocalDateTime.now());
        
        transactionRepository.save(tx);
    }
}