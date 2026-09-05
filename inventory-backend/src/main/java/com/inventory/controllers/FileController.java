package com.inventory.controllers;

import com.inventory.services.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

    @Autowired
    private FileStorageService storageService;

    @PostMapping("/upload")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STORE_MANAGER')") // Secure the endpoint
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            // Save the file and get the URL
            String fileUrl = storageService.save(file);
            
            // Return the URL in a JSON object: { "url": "/uploads/filename.jpg" }
            return ResponseEntity.ok(Map.of("url", fileUrl));
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Could not upload the file: " + e.getMessage()));
        }
    }
}