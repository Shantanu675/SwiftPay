package com.paypal.transaction_service.controller;


import com.paypal.transaction_service.entity.Transaction;
import com.paypal.transaction_service.service.TransactionService;
import com.paypal.transaction_service.util.JWTUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping("/api/transactions/")
public class TransactionController {
    private final TransactionService service;

    public TransactionController(TransactionService service) {
        this.service = service;
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@Valid @RequestBody Transaction transaction, HttpServletRequest request) {

        // Read userId from gateway header
        String userIdHeader = request.getHeader("X-User-Id");
        if (userIdHeader == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Missing X-User-Id header from gateway");
        }

        Long tokenUserId = Long.parseLong(userIdHeader);
        Long requestSenderId = transaction.getSenderId();

        System.out.println("Gateway userId: " + tokenUserId);
        System.out.println("Transaction senderId: " + requestSenderId);

        if (!requestSenderId.equals(tokenUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("User ID mismatch: You are not authorized to create this transaction.");
        }

        Transaction created = service.createTransaction(transaction);
        return ResponseEntity.ok(created);
    }



    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable("id") Long id) {
        Transaction transaction = service.getTransactionById(id);
        if (transaction == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Transaction with id " + id + " not found");
        }
        return ResponseEntity.ok(transaction);
    }


    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getTransactionsByUser(@PathVariable("userId") Long userId, HttpServletRequest request) {

        // Read JWT userId forwarded by gateway
        String tokenUserIdHeader = request.getHeader("X-User-Id");
        if (tokenUserIdHeader == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Missing X-User-Id header from gateway");
        }

        Long tokenUserId = Long.parseLong(tokenUserIdHeader);

        // Ensure user can only fetch their own transactions
        if (!userId.equals(tokenUserId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to view these transactions.");
        }

        List<Transaction> transactions = service.getTransactionsByUser(userId);

        return ResponseEntity.ok(transactions);
    }
}