package com.inventory.repositories;

import com.inventory.models.Product;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, String> {
    // You can add custom find methods here later if needed
}