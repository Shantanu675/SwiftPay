package com.paypal.reward_service.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.paypal.reward_service.entity.Reward;
import com.paypal.reward_service.entity.Transaction;
import com.paypal.reward_service.repository.RewardRepository;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class RewardConsumer {

    private final RewardRepository rewardRepository;

    private final ObjectMapper mapper;

    public RewardConsumer(RewardRepository rewardRepository, ObjectMapper mapper, ObjectMapper mapper1) {
        this.rewardRepository = rewardRepository;
        this.mapper = new ObjectMapper();
        this.mapper.registerModule(new JavaTimeModule());
        this.mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @KafkaListener(topics = "txn-initiated", groupId = "reward-service")
    public void consumerTransaction(Transaction transaction) {
        try {
            if (rewardRepository.existsByTransactionId(transaction.getId())) {
                System.out.println("⚠ Reward Already Existed for transaction: " + transaction.getId());
                return;
            }

            Reward reward = new Reward();
            reward.setUserId(transaction.getSenderId());
            reward.setPoints(transaction.getAmount() * 5);
            reward.setSentAt(LocalDateTime.now());
            reward.setTransactionId(transaction.getId());

            rewardRepository.save(reward);
            System.out.println("✅ Reward Saved : " + reward);

        } catch (Exception e) {
            System.out.println("❌ Failed to process Transaction " + transaction.getId() + " : " + e.getMessage());
            throw e;
        }
    }
}
