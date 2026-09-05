// package com.inventory.config;

// import com.inventory.security.AuthEntryPointJwt;
// import com.inventory.security.JwtAuthFilter;
// import com.inventory.services.UserDetailsServiceImpl;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;
// import org.springframework.security.authentication.AuthenticationManager;
// import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
// import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
// import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
// import org.springframework.security.config.annotation.web.builders.HttpSecurity;
// import org.springframework.security.config.http.SessionCreationPolicy;
// import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
// import org.springframework.security.crypto.password.PasswordEncoder;
// import org.springframework.security.web.SecurityFilterChain;
// import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration
// @EnableMethodSecurity // This enables @PreAuthorize
// public class SecurityConfig {

//     @Autowired
//     UserDetailsServiceImpl userDetailsService;

//     @Autowired
//     private AuthEntryPointJwt unauthorizedHandler;

//     @Bean
//     public JwtAuthFilter authenticationJwtTokenFilter() {
//         return new JwtAuthFilter();
//     }

//   @Bean
//     public DaoAuthenticationProvider authenticationProvider() {
        
//         DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(passwordEncoder()); 
        
//         authProvider.setUserDetailsService(userDetailsService);
//         return authProvider;
//     }

//     @Bean
//     public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
//         return authConfig.getAuthenticationManager();
//     }

//     @Bean
//     public PasswordEncoder passwordEncoder() {
//         return new BCryptPasswordEncoder();
//     }

//     @Bean
//     public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
//         http.csrf(csrf -> csrf.disable())
//          .cors(cors -> cors.configure(http))
//             .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
//             .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
//             .authorizeHttpRequests(auth -> 
//                 auth.requestMatchers("/api/auth/**").permitAll() 
//                 .requestMatchers("/uploads/**").permitAll()
//                 .requestMatchers("/public/**").permitAll()
//                     .anyRequest().authenticated() 
//             );

//         http.authenticationProvider(authenticationProvider());
//         http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
//         return http.build();
//     }
// }


package com.inventory.config;

import com.inventory.security.AuthEntryPointJwt;
import com.inventory.security.JwtAuthFilter;
import com.inventory.services.UserDetailsServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
// --- NEW IMPORTS FOR CORS ---
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import java.util.Arrays;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private AuthEntryPointJwt unauthorizedHandler;

    @Bean
    public JwtAuthFilter authenticationJwtTokenFilter() {
        return new JwtAuthFilter();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(passwordEncoder()); 
        authProvider.setUserDetailsService(userDetailsService);
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    // --- 1. DEFINE THE CORS CONFIGURATION HERE ---
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Allow your frontend
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:3000"));
        
        // Allow all HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Allow all headers (Authorization, Content-Type, etc.)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Allow credentials (cookies/tokens)
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply this config to ALL endpoints
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            // --- 2. TELL SECURITY TO USE THE BEAN ABOVE ---
            .cors(cors -> cors.configurationSource(corsConfigurationSource())) 
            
            .exceptionHandling(exception -> exception.authenticationEntryPoint(unauthorizedHandler))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> 
                auth.requestMatchers("/api/auth/**").permitAll() 
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/products", "/api/products/**").permitAll()
                .requestMatchers("/uploads/**").permitAll()
                .requestMatchers("/public/**").permitAll()
                // Explicitly allow OPTIONS requests for the preflight check
                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .anyRequest().authenticated() 
            );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authenticationJwtTokenFilter(), UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}