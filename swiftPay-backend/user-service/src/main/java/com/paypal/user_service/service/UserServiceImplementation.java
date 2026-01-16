package com.paypal.user_service.service;

import com.paypal.user_service.client.WalletClient;
import com.paypal.user_service.entity.User;
import com.paypal.user_service.repository.UserRepository;
import com.paypal.wallet_service.dto.CreateWalletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserServiceImplementation implements UserService{

    private UserRepository userRepository;

    private final WalletClient walletClient;

    @Autowired
    public UserServiceImplementation(UserRepository userRepository, WalletClient walletClient) {
        this.userRepository = userRepository;
        this.walletClient = walletClient;
    }

    @Override
    public User createUser(User user) {
        User savedUser = userRepository.save(user);
        try {
            CreateWalletRequest request = new CreateWalletRequest();
            request.setUserId(savedUser.getId());
            request.setCurrency("INR");
            walletClient.createWallet(request);
        }
        catch (Exception e) {
            userRepository.deleteById(savedUser.getId());
            throw new RuntimeException("Wallet Creation failed, user rollback", e);
        }
        return savedUser;
    }

    @Override
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
