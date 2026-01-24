package com.paypal.wallet_service.scheduler;

import com.paypal.wallet_service.entity.WalletHold;
import com.paypal.wallet_service.repository.WalletHoldRepository;
import com.paypal.wallet_service.service.WalletServiceImplementation;
import org.springframework.scheduling.annotation.Scheduled;

import java.time.LocalDateTime;
import java.util.List;

public class HoldExpiryScheduler {

    private final WalletHoldRepository walletHoldRepository;
    private final WalletServiceImplementation walletService;

    public HoldExpiryScheduler(WalletHoldRepository walletHoldRepository, WalletServiceImplementation walletService) {
        this.walletHoldRepository = walletHoldRepository;
        this.walletService = walletService;
    }

    @Scheduled(fixedRateString = "${wallet.hold.expiry.scan-rate-ms:60000}")
    public void expireOldHold() {
        LocalDateTime now = LocalDateTime.now();

        List<WalletHold> expired = walletHoldRepository.findByStatusAndExpiresAtBefore("ACTIVE", now);

        for (WalletHold hold : expired) {
            String ref = hold.getHoldReference();

            try {
               walletService.releaseHold(ref);
               System.out.println("Expired Hold Releases : " + ref);
            }
            catch (Exception e) {
                System.out.println("Failed to release expired holds");
            }
        }
    }
}
