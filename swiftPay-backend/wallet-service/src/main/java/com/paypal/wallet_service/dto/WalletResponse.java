package com.paypal.wallet_service.dto;

public class WalletResponse {
    private Long id;
    private Long userId;
    private String currency;
    private Long balance;
    private Long availableBalance;

    public WalletResponse() {
    }

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

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public Long getBalance() {
        return balance;
    }

    public void setBalance(Long balance) {
        this.balance = balance;
    }

    public Long getAvailableBalance() {
        return availableBalance;
    }

    public void setAvailableBalance(Long availableBalance) {
        this.availableBalance = availableBalance;
    }
}