// package com.inventory.config;

// import org.springframework.context.annotation.Configuration;
// import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
// import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
// import java.nio.file.Paths;

// @Configuration
// public class WebConfig implements WebMvcConfigurer {

//     @Override
//     public void addResourceHandlers(ResourceHandlerRegistry registry) {
//         // This makes files in the "uploads" directory accessible via the "/uploads" URL path
//         String uploadDir = Paths.get("uploads").toAbsolutePath().normalize().toString();
        
//         // Note: "file:/" is crucial for accessing the file system
//         registry.addResourceHandler("/uploads/**")
//                 .addResourceLocations("file:/" + uploadDir + "/");
//     }
// }

package com.inventory.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow React (port 3000) to call any endpoint starting with /api/
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000") 
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // Explicitly allow OPTIONS
                .allowedHeaders("*") // Allow all headers (like Authorization)
                .allowCredentials(true)
                .maxAge(3600);
    }
}