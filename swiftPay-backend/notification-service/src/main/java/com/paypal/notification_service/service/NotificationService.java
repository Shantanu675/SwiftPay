package com.paypal.notification_service.service;

import com.paypal.notification_service.entity.Notification;

import java.util.List;

public interface NotificationService {

    Notification sendNotification(Notification notification);

    List<Notification> getNotificationsByUserId(Long userId);
}
