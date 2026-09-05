package com.inventory.repositories;

import com.inventory.models.PurchaseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;


public interface PurchaseOrderRepository extends MongoRepository<PurchaseOrder, String> {
    Optional<PurchaseOrder> findByConfirmationToken(String confirmationToken);
}