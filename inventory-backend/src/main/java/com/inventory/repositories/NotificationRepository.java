package com.inventory.repositories;

import com.inventory.models.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Find unread notifications to show on the bell
    List<Notification> findByIsReadFalseOrderByCreatedAtDesc();
    // Find all, sorted by date
    List<Notification> findAllByOrderByCreatedAtDesc();
Optional<Notification> findByProductIdAndTypeAndIsReadFalse(String productId, String type);
}