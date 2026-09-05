package com.inventory.controllers;

import com.inventory.models.User;
import com.inventory.payload.MessageResponse;
import com.inventory.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") 
public class AdminValidationController {

    @Autowired
    private UserRepository userRepository;

    // Get all pending admins
    @GetMapping("/pending")
    public List<User> getPendingAdmins() {
return userRepository.findByRoleInAndValidated(
            List.of("ROLE_ADMIN", "ROLE_STORE_MANAGER"), 
            false
        );    }

    // Approve an admin
    @PostMapping("/approve/{userId}")
    public ResponseEntity<?> approveAdmin(@PathVariable String userId) {
        Optional<User> optionalUser = userRepository.findById(userId);
        if (!optionalUser.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: User not found."));
        }
        User user = optionalUser.get();
        user.setValidated(true);
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Admin approved successfully!"));
    }

    // Decline/delete an admin
    @DeleteMapping("/decline/{userId}")
    public ResponseEntity<?> declineAdmin(@PathVariable String userId) {
        userRepository.deleteById(userId);
        return ResponseEntity.ok(new MessageResponse("Admin declined and removed."));
    }
}