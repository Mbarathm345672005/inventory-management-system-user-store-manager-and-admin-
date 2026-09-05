package com.inventory.repositories;

import com.inventory.models.Transaction;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    // This method automatically finds the 50 most recent transactions
    List<Transaction> findTop50ByOrderByTimestampDesc();
    List<Transaction> findByType(String type);
    List<Transaction> findByTypeAndTimestampBetween(String type, LocalDateTime start, LocalDateTime end);
    List<Transaction> findByTypeInAndTimestampBetween(List<String> types, LocalDateTime start, LocalDateTime end);
}