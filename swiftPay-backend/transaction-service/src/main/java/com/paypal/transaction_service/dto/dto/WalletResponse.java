package com.paypal.transaction_service.dto.dto;

public class WalletResponse {
    private Long id;
    private Long userId;
    private String currency;
    private Long balance;
    private Long availableBalance;

    public WalletResponse(Long id, Long userId, String currency, Long balance, Long availableBalance) {
        this.id = id;
        this.userId = userId;
        this.currency = currency;
        this.balance = balance;
        this.availableBalance = availableBalance;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getCurrency() {
        return currency;
    }

    public Long getBalance() {
        return balance;
    }

    public Long getAvailableBalance() {
        return availableBalance;
    }
}