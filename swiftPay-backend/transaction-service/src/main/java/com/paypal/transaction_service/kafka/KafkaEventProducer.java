package com.paypal.transaction_service.kafka;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.paypal.transaction_service.entity.Transaction;
import org.apache.kafka.clients.producer.RecordMetadata;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.SendResult;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
public class KafkaEventProducer {

    private static final String TOPIC = "txn-initiated";

    private final KafkaTemplate<String, Transaction> kafkaTemplate;

    private final ObjectMapper objectMapper;

    @Autowired
    public KafkaEventProducer(KafkaTemplate<String, Transaction> kafkaTemplate, ObjectMapper objectMapper) {
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.objectMapper.registerModule(new JavaTimeModule());
    }

//    public void sendTransactionEvent(String key, String message) {
//        System.out.println("Sending to kafka + Topic" + TOPIC + ", key " + key + ", Message " + message);
//        CompletableFuture<SendResult<String, String>> future = kafkaTemplate.send(TOPIC, key, message);
//
//        future.thenAccept(result -> {
//            RecordMetadata metadata = result.getRecordMetadata();
//            System.out.println("Kafka message sent successfully! TOPIC: " + metadata.topic() + ", Partition: " + metadata.partition() + ", Offset: " + metadata.offset());
//        }).exceptionally(ex -> {
//            System.out.println("Failed to send Kafka Message: " + ex.getMessage());
//            return null;
//        });
//    }

    public void sendTransactionEvent(String key, Transaction transaction) {
        System.out.println("Sending to kafka + Topic " + TOPIC + ", key: " + key + ", Message: " + transaction);
        CompletableFuture<SendResult<String, Transaction>> future = kafkaTemplate.send(TOPIC, key, transaction);

        future.thenAccept(result -> {
            RecordMetadata metadata = result.getRecordMetadata();
            System.out.println("Kafka message sent successfully! TOPIC: " + metadata.topic() + ", Partition: " + metadata.partition() + ", Offset: " + metadata.offset());
        }).exceptionally(ex -> {
            System.out.println("Failed to send Kafka Message: " + ex.getMessage());
            ex.printStackTrace();
            return null;
        });
    }
}
