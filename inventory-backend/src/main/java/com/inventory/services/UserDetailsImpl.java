package com.inventory.services;

import com.inventory.models.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.util.Collection;
import java.util.List;

public class UserDetailsImpl implements UserDetails {
    private String id;
    private String email;
    private String password;
    private boolean validated;
    private GrantedAuthority authority;

    public UserDetailsImpl(String id, String email, String password, boolean validated, GrantedAuthority authority) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.validated = validated;
        this.authority = authority;
    }

    public static UserDetailsImpl build(User user) {
        GrantedAuthority authority = new SimpleGrantedAuthority(user.getRole());
        return new UserDetailsImpl(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.isValidated(),
                authority
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(authority);
    }

    // Add getters for id, email, validated
    public String getId() { return id; }
    public boolean isValidated() { return validated; }
    public String getRole() { return authority.getAuthority(); }

    @Override
    public String getPassword() { return password; }
    @Override
    public String getUsername() { return email; } 
    @Override
    public boolean isAccountNonExpired() { return true; }
    @Override
    public boolean isAccountNonLocked() { return true; }
    @Override
    public boolean isCredentialsNonExpired() { return true; }
    @Override
    public boolean isEnabled() { return true; } 
}