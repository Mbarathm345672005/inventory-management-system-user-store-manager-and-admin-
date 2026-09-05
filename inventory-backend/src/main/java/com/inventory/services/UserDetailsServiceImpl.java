package com.inventory.services;

import com.inventory.models.User;
import com.inventory.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    @Autowired
    UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        
        System.out.println("Attempting to load user by email: " + email);
        // ---------------------------

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    System.out.println("USER NOT FOUND with email: " + email);
                    // ---------------------------
                    return new UsernameNotFoundException("User Not Found with email: " + email);
                });

        System.out.println("USER FOUND: " + user.getEmail());
        // ---------------------------

        return UserDetailsImpl.build(user);
    }
}