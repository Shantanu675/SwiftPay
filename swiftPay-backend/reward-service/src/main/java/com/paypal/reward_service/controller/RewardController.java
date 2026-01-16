package com.paypal.reward_service.controller;

import com.paypal.reward_service.entity.Reward;
import com.paypal.reward_service.repository.RewardRepository;
import com.paypal.reward_service.service.RewardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rewards/")
public class RewardController {

    private final RewardRepository rewardRepository;

    public RewardController(RewardRepository rewardRepository) {
        this.rewardRepository = rewardRepository;
    }

    @GetMapping
    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }

    @GetMapping("/user/{userId}")
    public List<Reward> getRewardsByUserId(@PathVariable Long userId) {
//        return rewardService.getRewardsByUserId(userId);
        return rewardRepository.findByUserId(userId);
    }
}
