package com.paypal.wallet_service.controller;


import com.paypal.wallet_service.dto.*;
import com.paypal.wallet_service.service.WalletServiceImplementation;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/wallets")
public class WalletController {

    private final WalletServiceImplementation walletService;

    public WalletController(WalletServiceImplementation walletService) {
        this.walletService = walletService;
    }

    @PostMapping
    public ResponseEntity<WalletResponse> createWallet(@RequestBody CreateWalletRequest request) {
        return ResponseEntity.ok(walletService.createWallet(request));
    }

    @PostMapping("/credit")
    public ResponseEntity<WalletResponse> credit(@RequestBody CreditRequest request) {
        return ResponseEntity.ok(walletService.credit(request));
    }

    @PostMapping("/debit")
    public ResponseEntity<WalletResponse> debit(@RequestBody DebitRequest request) {
        return ResponseEntity.ok(walletService.debit(request));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WalletResponse> getWallet(@PathVariable Long userId) {
        return ResponseEntity.ok(walletService.getWallet(userId));
    }

    @PostMapping("/hold")
    public ResponseEntity<HoldResponse> placeHold(@RequestBody HoldRequest request) {
        return ResponseEntity.ok(walletService.placeHold(request));
    }

    @PostMapping("/capture")
    public ResponseEntity<WalletResponse> capture(@RequestBody CaptureRequest request) {
        return ResponseEntity.ok(walletService.captureHold(request));
    }

    @PostMapping("/release/{holdReference}")
    public ResponseEntity<HoldResponse> release(@PathVariable String holdReference) {
        return ResponseEntity.ok(walletService.releaseHold(holdReference));
    }
}