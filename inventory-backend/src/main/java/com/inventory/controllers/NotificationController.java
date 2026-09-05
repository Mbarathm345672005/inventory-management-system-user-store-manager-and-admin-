package com.inventory.controllers;

import com.inventory.models.Notification;
import com.inventory.models.Product;
import com.inventory.repositories.NotificationRepository;
import com.inventory.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/notifications")
@PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')")
public class NotificationController {

    @Autowired private NotificationRepository notificationRepository;
    @Autowired private ProductRepository productRepository;

    // 1. Check for issues and return all notifications
    @GetMapping
    public ResponseEntity<List<Notification>> getAllNotifications() {
        // generateAlerts(); // Run the check every time admin looks
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }
    
    // 2. Get count of unread
    @GetMapping("/unread-count")
    public ResponseEntity<Integer> getUnreadCount() {
        generateAlerts();
        return ResponseEntity.ok(notificationRepository.findByIsReadFalseOrderByCreatedAtDesc().size());
    }

    // 3. Mark as Read (Dismiss)
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        Optional<Notification> notif = notificationRepository.findById(id);
        if (notif.isPresent()) {
            Notification n = notif.get();
            n.setRead(true);
            notificationRepository.save(n);
        }
        return ResponseEntity.ok().build();
    }

    // --- Logic to Auto-Generate Alerts ---
    private void generateAlerts() {
        List<Product> products = productRepository.findAll();
        LocalDate today = LocalDate.now();
        LocalDate warningDate = today.plusDays(7); // Warn 7 days before expiry

        for (Product p : products) {
            // A. Low Stock Alert
            if (p.getQuantity() <= 5) {
                createUniqueNotification(p.getId(),"Low Stock Alert: " + p.getName() + " has only " + p.getQuantity() + " left.", "LOW_STOCK");
            }
            else {
                // CRITICAL FIX: If stock is now healthy ( > 5 ), dismiss the LOW_STOCK alert.
                notificationRepository.findByProductIdAndTypeAndIsReadFalse(p.getId(), "LOW_STOCK")
                    .ifPresent(n -> {
                        n.setRead(true);
                        notificationRepository.save(n);
                    });
            }

            // B. Expiry Alert
            if (p.getExpiryDate() != null) {
                if (p.getExpiryDate().isBefore(today)) {
                    createUniqueNotification(p.getId(),"EXPIRED: " + p.getName() + " expired on " + p.getExpiryDate(), "EXPIRY_CRITICAL");
                } else if (p.getExpiryDate().isBefore(warningDate)) {
                    createUniqueNotification(p.getId(),"Expiring Soon: " + p.getName() + " expires on " + p.getExpiryDate(), "EXPIRY_WARNING");
                }
            }
        }
    }

    private void createUniqueNotification(String productId, String message, String type) {
        // Find existing UNREAD notification for this specific product AND type
        Optional<Notification> existing = notificationRepository.findByProductIdAndTypeAndIsReadFalse(productId, type);
        
        if (existing.isPresent()) {
            // Case 1: Alert exists. Update the message with the *latest* quantity/info.
            Notification n = existing.get();
            n.setMessage(message);
            // No need to update createdAt, it retains its original time.
            notificationRepository.save(n);
        } else {
            // Case 2: No unread alert exists. Create a new one.
            Notification n = new Notification();
            n.setProductId(productId); // <-- Save the product ID
            n.setMessage(message);
            n.setType(type);
            n.setRead(false);
            n.setCreatedAt(LocalDateTime.now());
            notificationRepository.save(n);
        }
    }
}