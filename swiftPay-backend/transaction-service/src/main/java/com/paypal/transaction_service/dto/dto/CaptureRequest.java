package com.paypal.transaction_service.dto.dto;

public class CaptureRequest {
    private String holdReference;

    public String getHoldReference() {
        return holdReference;
    }

    public void setHoldReference(String holdReference) {
        this.holdReference = holdReference;
    }
}