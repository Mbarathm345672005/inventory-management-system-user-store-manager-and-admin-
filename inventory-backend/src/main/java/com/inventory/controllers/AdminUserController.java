package com.inventory.controllers;

import com.inventory.models.User;
import com.inventory.payload.MessageResponse;
import com.inventory.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600)
@RestController
@RequestMapping("/api/admin/users")
// CRITICAL: Only Admin can access this controller
@PreAuthorize("hasRole('ADMIN')") 
public class AdminUserController {

    @Autowired
    UserRepository userRepository;

    // 1. Get All Store Managers
    @GetMapping("/store-managers")
    public ResponseEntity<List<User>> getStoreManagers() {
        // Fetch only users who have the role string "ROLE_STORE_MANAGER"
        List<User> managers = userRepository.findByRole("ROLE_STORE_MANAGER");
        return ResponseEntity.ok(managers);
    }

    // 2. Delete a Store Manager (Revoke Access)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found!"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Store Manager account deleted successfully!"));
    }
}