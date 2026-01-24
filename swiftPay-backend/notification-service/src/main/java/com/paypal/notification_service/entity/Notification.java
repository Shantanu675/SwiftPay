package com.paypal.notification_service.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private  String message;
    private LocalDateTime sendAt;
    @Column(nullable = false, columnDefinition = "boolean default false")
    private boolean isRead = false;

    public Notification() {
    }

    public Notification(Long id, Long userId, String message, LocalDateTime sendAt) {
        this.id = id;
        this.userId = userId;
        this.message = message;
        this.sendAt = sendAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getSendAt() {
        return sendAt;
    }

    public void setSendAt(LocalDateTime sendAt) {
        this.sendAt = sendAt;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {  // or setIsRead(boolean isRead)
        this.isRead = read;
    }
}
