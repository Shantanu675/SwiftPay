package com.paypal.wallet_service.service;

import com.paypal.wallet_service.dto.*;

public interface WalletService {
    WalletResponse createWallet(CreateWalletRequest request);

    WalletResponse credit(CreditRequest request);

    WalletResponse debit(DebitRequest request);

    WalletResponse getWallet(Long userId);

    HoldResponse placeHold(HoldRequest request);

    WalletResponse captureHold(CaptureRequest request);

    HoldResponse releaseHold(String holdReference);
}
