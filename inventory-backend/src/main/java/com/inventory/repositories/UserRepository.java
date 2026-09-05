package com.inventory.repositories;

import com.inventory.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    
    // --- NEW: Find users by a specific role (e.g., "ROLE_STORE_MANAGER") ---
    List<User> findByRole(String role);

    // Keep your existing methods
    List<User> findByRoleInAndValidated(List<String> roles, boolean validated);
    Optional<User> findByResetToken(String resetToken);
}