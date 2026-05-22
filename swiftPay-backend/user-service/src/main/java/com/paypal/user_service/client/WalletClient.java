package com.paypal.user_service.client;

import com.paypal.user_service.dto.CreateWalletRequest;
import com.paypal.user_service.dto.WalletResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "wallet-service", url = "http://wallet-service:8088/api/v1/wallets")
public interface WalletClient {

    @PostMapping
    WalletResponse createWallet(@RequestBody CreateWalletRequest request);
}
