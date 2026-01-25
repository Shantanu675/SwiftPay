package com.paypal.notification_service.entity;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    // ──── This is the key change ────
    @Column(name = "send_at")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS")
    // or with timezone offset: @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSXXX", timezone = "Asia/Kolkata")
    private LocalDateTime sendAt;

    @Column(name = "is_read", nullable = false, columnDefinition = "boolean default false")
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

    // Getter / Setter can stay modern naming
    public boolean getIsRead() {
        return isRead;
    }

    public void setRead(boolean read) {     // ← or setIsRead, doesn't matter
        this.isRead = read;
    }
}
