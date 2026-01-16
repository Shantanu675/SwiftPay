package com.paypal.transaction_service.dto.dto;

public class HoldResponse {
    private String holdReference;
    private Long amount;
    private String status;

    public HoldResponse(String holdReference, Long amount, String status) {
        this.holdReference = holdReference;
        this.amount = amount;
        this.status = status;
    }

    public String getHoldReference() {
        return holdReference;
    }

    public Long getAmount() {
        return amount;
    }

    public String getStatus() {
        return status;
    }
}