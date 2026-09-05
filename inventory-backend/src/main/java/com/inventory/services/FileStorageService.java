package com.inventory.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import jakarta.annotation.PostConstruct;

@Service
public class FileStorageService {

    // Define the upload directory (this will create a folder named "uploads" in your project's root)
    private final Path rootLocation = Paths.get("uploads");

    // This method runs when the service is created. It creates the "uploads" directory if it doesn't exist.
    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage location", e);
        }
    }

    // This method saves the file and returns the *URL* to access it
    public String save(MultipartFile file) {
        try {
            if (file.isEmpty()) {
                throw new RuntimeException("Failed to store empty file.");
            }
            
            // Generate a unique filename to prevent conflicts
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // Resolve the destination path
            Path destinationFile = this.rootLocation.resolve(uniqueFilename).normalize().toAbsolutePath();

            // Copy the file to the destination
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }

            // Return the *web-accessible URL* for the file
            // This URL will be handled by our new WebConfig (Step 3)
            return "/uploads/" + uniqueFilename;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file.", e);
        }
    }
}