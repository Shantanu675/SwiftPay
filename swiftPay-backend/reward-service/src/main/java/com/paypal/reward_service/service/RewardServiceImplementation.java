package com.paypal.reward_service.service;

import com.paypal.reward_service.entity.Reward;
import com.paypal.reward_service.repository.RewardRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RewardServiceImplementation implements RewardService{

    private final RewardRepository rewardRepository;

    public RewardServiceImplementation (RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    public Reward sendReward(Reward reward) {
        reward.setSentAt(LocalDateTime.now());
        return rewardRepository.save(reward);
    }

    @Override
    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }

    public List<Reward> getRewardsByUserId(Long userId) {
        return rewardRepository.findByUserId(userId);
    }
}
