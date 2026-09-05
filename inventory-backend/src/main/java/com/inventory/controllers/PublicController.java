package com.inventory.controllers;

import com.inventory.models.PurchaseOrder;
import com.inventory.repositories.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/public/po")
public class PublicController {

    @Autowired
    private PurchaseOrderRepository poRepository;

    // This endpoint is NOT secured by Spring Security
    @GetMapping("/confirm/{token}")
    public ResponseEntity<String> confirmOrder(@PathVariable String token) {
        Optional<PurchaseOrder> optionalPo = poRepository.findByConfirmationToken(token);

        if (!optionalPo.isPresent()) {
            return ResponseEntity.status(404).body("Error: Invalid or expired purchase order link.");
        }

        PurchaseOrder po = optionalPo.get();

        if ("CONFIRMED".equals(po.getStatus())) {
            return ResponseEntity.ok("Order " + po.getId() + " already CONFIRMED on " + po.getConfirmedAt());
        }

        // 1. Update status to CONFIRMED
        po.setStatus("CONFIRMED");
        po.setConfirmedAt(LocalDateTime.now());
        // 2. Clear token for security
        po.setConfirmationToken(null); 
        poRepository.save(po);

        return ResponseEntity.ok("Purchase Order Confirmed. Thank you for your prompt response!");
    }
}