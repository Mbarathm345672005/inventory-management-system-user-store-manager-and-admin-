package com.inventory.controllers;

import com.inventory.models.CartItem;
import com.inventory.models.User;
import com.inventory.payload.MessageResponse;
import com.inventory.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

import com.inventory.models.Transaction; // <-- 1. IMPORT
import com.inventory.repositories.TransactionRepository; // <-- 2. IMPORT
import java.time.LocalDateTime; // <-- 3. IMPORT

import java.util.Optional;
import com.inventory.models.Product;
import com.inventory.repositories.ProductRepository;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
public class UserController {

    @Autowired
    private UserRepository userRepository;
@Autowired
    private ProductRepository productRepository;
    @Autowired private TransactionRepository transactionRepository;
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Error: User not found."));
    }

    // --- NEW "ADD TO CART" ENDPOINT ---
    // --- UPDATED "ADD TO CART" ENDPOINT ---
    @PostMapping("/cart")
    public ResponseEntity<?> addToCart(@RequestBody CartItem newCartItem) {
        User user = getCurrentUser();
        List<CartItem> cart = user.getCart();

        String productId = newCartItem.getProductId();
        int requestedQuantity = newCartItem.getQuantity();

        // 1. Check if product exists
        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (!optionalProduct.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Product not found!"));
        }

        Product product = optionalProduct.get();

        // 2. Check if the requested quantity is *even available* (don't remove it yet)
        if (product.getQuantity() < requestedQuantity) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Not enough items in stock!"));
        }

        // 3. Add to cart (same logic as before)
        Optional<CartItem> existingItem = cart.stream()
                .filter(item -> item.getProductId().equals(newCartItem.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            // Check stock again for existing item + new quantity
            if (product.getQuantity() < existingItem.get().getQuantity() + requestedQuantity) {
                 return ResponseEntity.badRequest().body(new MessageResponse("Error: Not enough items in stock to add more!"));
            }
            existingItem.get().setQuantity(existingItem.get().getQuantity() + newCartItem.getQuantity());
        } else {
            cart.add(newCartItem);
        }

        // 4. We DO NOT modify product stock here anymore
        // 5. We DO NOT log a transaction here anymore
        
        // 6. Just save the user's cart
        user.setCart(cart);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Item added to cart successfully!"));
    }

    @GetMapping("/cart")
    public ResponseEntity<List<CartItem>> getCart() {
        User user = getCurrentUser();
        return ResponseEntity.ok(user.getCart());
    }

    // --- NEW "REMOVE FROM CART" ENDPOINT ---
   // --- UPDATED "REMOVE FROM CART" ENDPOINT ---
    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<?> removeFromCart(@PathVariable String productId) {
        User user = getCurrentUser();
        List<CartItem> cart = user.getCart();

        // Find the item to remove
        Optional<CartItem> itemToRemove = cart.stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst();
        
        if (!itemToRemove.isPresent()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Item not found in cart."));
        }

        // Remove the item
        cart.removeIf(item -> item.getProductId().equals(productId));

        // No need to update product stock
        
        user.setCart(cart);
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Item removed from cart successfully!"));
    }
    @PostMapping("/checkout")
    public ResponseEntity<?> checkout() {
        User user = getCurrentUser();
        List<CartItem> cart = user.getCart();

        if (cart.isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Error: Cart is empty!"));
        }

        // --- 1. Verify all items in cart are in stock ---
        // (This is a simplified check. In a real system, you'd use database transactions
        // to "lock" the products to prevent a race condition)
        for (CartItem item : cart) {
            Optional<Product> optionalProduct = productRepository.findById(item.getProductId());
            
            if (!optionalProduct.isPresent()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Product " + item.getProductId() + " not found."));
            }

            Product product = optionalProduct.get();
            if (product.getQuantity() < item.getQuantity()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Error: Item " + product.getName() + " is out of stock."));
            }
        }

        // --- 2. If all checks pass, "process" the sale ---
        for (CartItem item : cart) {
            // We know the product exists from the check above
            Product product = productRepository.findById(item.getProductId()).get();

            // 2a. Decrease stock
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);

            // 2b. Log the final transaction
            logTransaction(product, "SALE", item.getQuantity());
        }

        // --- 3. Clear the user's cart ---
        user.setCart(new java.util.ArrayList<>()); // Create a new empty list
        userRepository.save(user);

        return ResponseEntity.ok(new MessageResponse("Checkout successful!"));
    }
    private void logTransaction(Product product, String type, int quantity) {
        // We get the user's email from the security context
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String handledBy = auth.getName(); 

        Transaction tx = new Transaction();
        tx.setProductId(product.getId());
        tx.setProductName(product.getName());
        tx.setType(type);
        tx.setQuantity(quantity);
        tx.setHandledBy(handledBy); // This will be the user's email
        tx.setTimestamp(LocalDateTime.now());
        
        transactionRepository.save(tx);
    }
}