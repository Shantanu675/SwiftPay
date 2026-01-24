package com.paypal.wallet_service.service;

import com.paypal.wallet_service.dto.*;
import com.paypal.wallet_service.entity.Transaction;
import com.paypal.wallet_service.entity.Wallet;
import com.paypal.wallet_service.entity.WalletHold;
import com.paypal.wallet_service.exceptions.InsufficientFundsException;
import com.paypal.wallet_service.exceptions.NotFoundException;
import com.paypal.wallet_service.repository.TransactionRepository;
import com.paypal.wallet_service.repository.WalletHoldRepository;
import com.paypal.wallet_service.repository.WalletRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class WalletServiceImplementation implements WalletService{
    private WalletHoldRepository walletHoldRepository;

    private WalletRepository walletRepository;

    private TransactionRepository transactionRepository;

    public WalletServiceImplementation(WalletHoldRepository walletHoldRepository, WalletRepository walletRepository, TransactionRepository transactionRepository) {
        this.walletHoldRepository = walletHoldRepository;
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
    }

    @Override
    @Transactional
    public WalletResponse createWallet(CreateWalletRequest request) {
        Wallet wallet = new Wallet(request.getUserId(), request.getCurrency());
        Wallet saved = walletRepository.save(wallet);

        return new WalletResponse(
                saved.getId(), saved.getUserId(), saved.getCurrency(),
                saved.getBalance(), saved.getAvailableBalance()
        );
    }

    @Override
    @Transactional
    public WalletResponse credit(CreditRequest request) {
        System.out.println("CREDIT request received: userId = " + request.getUserId() +
                        " amount = " + request.getAmount() +
                        " currency = " + request.getCurrency());

        Wallet wallet = walletRepository.findByUserIdAndCurrency(request.getUserId(), "INR")
                .orElseThrow(() -> new NotFoundException("Wallet not found for user " + request.getUserId()));

        wallet.setBalance(wallet.getBalance() + request.getAmount());
        wallet.setAvailableBalance(wallet.getAvailableBalance() + request.getAmount());

        Wallet saved = walletRepository.save(wallet);

        Long amount = request.getAmount();
        transactionRepository.save(
                new Transaction(wallet.getId(), "CREDIT", amount, "SUCCESS")
        );

        System.out.println("✅ CREDIT done: walletId = " + saved.getId() +
                ", newBalance = " + saved.getBalance() +
                ", availableBalance = " + saved.getAvailableBalance());

        return new WalletResponse(
                saved.getId(), saved.getUserId(), saved.getCurrency(),
                saved.getBalance(), saved.getAvailableBalance()
        );
    }

    @Override
    @Transactional
    public WalletResponse debit(DebitRequest request) {
        System.out.println("✅ DEBIT request received: userId = " + request.getUserId() +
                " amount = " + request.getAmount() +
                " currency = " + request.getCurrency());

        Wallet wallet = walletRepository.findByUserIdAndCurrency(request.getUserId(), "INR")
                .orElseThrow(() -> new NotFoundException("Wallet not found for user " + request.getUserId()));

        if(wallet.getAvailableBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Not Enough Balance");
        }

        wallet.setBalance(wallet.getBalance() - request.getAmount());
        wallet.setAvailableBalance(wallet.getAvailableBalance() - request.getAmount());

        Wallet saved = walletRepository.save(wallet);

        System.out.println("✅ DEBIT done: walletId=" + saved.getId() +
                ", newBalance=" + saved.getBalance() +
                ", availableBalance=" + saved.getAvailableBalance());

        return new WalletResponse(
                saved.getId(), saved.getUserId(), saved.getCurrency(),
                saved.getBalance(), saved.getAvailableBalance()
        );
    }

    @Override
    public WalletResponse getWallet(Long userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(() -> new NotFoundException("Wallet not found for user: " + userId));

        return new WalletResponse(
                wallet.getId(), wallet.getUserId(), wallet.getCurrency(),
                wallet.getBalance(), wallet.getAvailableBalance()
        );
    }

    @Override
    @Transactional
    public HoldResponse placeHold(HoldRequest request) {
        Wallet wallet = walletRepository.findByUserIdAndCurrency(request.getUserId(), request.getCurrency())
                .orElseThrow(() -> new NotFoundException("Wallet not found for user : " + request.getUserId()));

        if(wallet.getAvailableBalance() < request.getAmount()) {
            throw new InsufficientFundsException("Not enough balance to hold");
        }

        wallet.setAvailableBalance(wallet.getAvailableBalance() - request.getAmount());

        LocalDateTime now = LocalDateTime.now();

        WalletHold hold = new WalletHold();
        hold.setWallet(wallet);
        hold.setAmount(request.getAmount());
        hold.setHoldReference("HOLD-" + System.currentTimeMillis());
        hold.setStatus("ACTIVE");
        hold.setExpiresAt(now.plusMinutes(15));

        walletRepository.save(wallet);
        walletHoldRepository.save(hold);

        return new HoldResponse(hold.getHoldReference(), hold.getAmount(), hold.getStatus());
    }

    @Override
    @Transactional
    public WalletResponse captureHold(CaptureRequest request) {
        WalletHold hold = walletHoldRepository.findByHoldReference(request.getHoldReference())
                .orElseThrow(() -> new NotFoundException("Hold not found"));

        if (!"ACTIVE".equals(hold.getStatus())) {
            throw new IllegalStateException("Hold is not active");
        }

        Wallet wallet = hold.getWallet();
        wallet.setBalance(wallet.getBalance() - hold.getAmount());

        hold.setStatus("CAPTURED");
        walletRepository.save(wallet);
        walletHoldRepository.save(hold);

        return new WalletResponse(wallet.getId(), wallet.getUserId(),
                wallet.getCurrency(), wallet.getBalance(), wallet.getAvailableBalance());
    }

    @Override
    @Transactional
    public HoldResponse releaseHold(String holdReference) {
        WalletHold hold = walletHoldRepository.findByHoldReference(holdReference)
                .orElseThrow(() -> new NotFoundException("Hold not found"));

        if (!"ACTIVE".equals(hold.getStatus())) {
            throw new IllegalStateException("Hold is not active");
        }

        Wallet wallet = hold.getWallet();
        wallet.setAvailableBalance(wallet.getAvailableBalance() + hold.getAmount());

        hold.setStatus("RELEASED");
        walletRepository.save(wallet);
        walletHoldRepository.save(hold);

        return new HoldResponse(hold.getHoldReference(), hold.getAmount(), hold.getStatus());
    }
}
