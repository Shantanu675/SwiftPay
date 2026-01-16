package com.paypal.transaction_service.repository;

import com.paypal.transaction_service.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findBySenderIdOrReceiverId(Long senderId, Long receiverId);

}
