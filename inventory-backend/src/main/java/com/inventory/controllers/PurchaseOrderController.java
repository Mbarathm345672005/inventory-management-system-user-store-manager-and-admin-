package com.inventory.controllers;

import com.inventory.models.PurchaseOrder;
import com.inventory.payload.ForecastDTO;
import com.inventory.payload.MessageResponse;
import com.inventory.repositories.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/restock")
@PreAuthorize("hasRole('ADMIN')")
public class PurchaseOrderController {

    @Autowired
    private ForecastingController forecastingController; // Reuse AI logic!

    @Autowired
    private PurchaseOrderRepository poRepository;

    @Autowired
    private JavaMailSender mailSender;

    // 1. Get Suggestions (Reuse AI Forecast)
    @GetMapping("/suggestions")
    public ResponseEntity<List<ForecastDTO>> getRestockSuggestions() {
        // Call the existing forecast logic
        List<ForecastDTO> allForecasts = forecastingController.getFullForecast().getBody();

        // Filter only items that have LOW STOCK or STOCKOUT
        List<ForecastDTO> suggestions = allForecasts.stream()
                .filter(item -> "STOCKOUT".equals(item.getAction()) || item.getAction().contains("WARNING"))
                .collect(Collectors.toList());

        return ResponseEntity.ok(suggestions);
    }

    // 2. Create PO and Send Email
    @PostMapping("/create-po")
    public ResponseEntity<?> createPurchaseOrder(@RequestBody PurchaseOrder poRequest) {
        try {
            // Generate unique token
            String token = UUID.randomUUID().toString();
            String confirmationLink = "http://localhost:8080/public/po/confirm/" + token; // Backend processing URL

            // A. Save to Database
            poRequest.setStatus("SENT");
            poRequest.setConfirmationToken(token); // Save the token
            poRequest.setCreatedAt(LocalDateTime.now());
            poRepository.save(poRequest);

            // B. Send Email with Link
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(poRequest.getVendorEmail());
            message.setSubject("URGENT: Purchase Order Confirmation - " + poRequest.getProductName());
            
            String emailBody = "Dear Vendor,\n\n" +
                    "We require the following stock immediately:\n" +
                    "Product: " + poRequest.getProductName() + "\n" +
                    "Quantity: " + poRequest.getQuantityToOrder() + "\n\n" +
                    "To confirm this order, please click the link below:\n" +
                    confirmationLink + "\n\n" + // <-- The crucial link
                    "Thank you,\nInventory System";
            
            message.setText(emailBody);
            mailSender.send(message);

            return ResponseEntity.ok(new MessageResponse("PO Created and Email Sent Successfully!"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new MessageResponse("Error sending email: " + e.getMessage()));
        }
    }
    @GetMapping("/history")
public ResponseEntity<List<PurchaseOrder>> getAllPOs() {
    return ResponseEntity.ok(poRepository.findAll());
}
}