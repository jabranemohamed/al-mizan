package com.mizan.almizan.service;

import com.mizan.almizan.dto.BalanceDTO;
import com.mizan.almizan.dto.CheckActionRequest;
import com.mizan.almizan.entity.*;
import com.mizan.almizan.repository.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class BalanceService {

    private final UserDailyActionRepository userDailyActionRepository;
    private final ActionRepository actionRepository;
    private final UserRepository userRepository;
    private final DailyBalanceRepository dailyBalanceRepository;
    private final Counter goodActionCounter;
    private final Counter badActionCounter;

    public BalanceService(UserDailyActionRepository userDailyActionRepository,
                          ActionRepository actionRepository,
                          UserRepository userRepository,
                          DailyBalanceRepository dailyBalanceRepository,
                          MeterRegistry meterRegistry) {
        this.userDailyActionRepository = userDailyActionRepository;
        this.actionRepository = actionRepository;
        this.userRepository = userRepository;
        this.dailyBalanceRepository = dailyBalanceRepository;

        // Custom Prometheus metrics
        this.goodActionCounter = Counter.builder("mizan.actions.good")
                .description("Total good actions checked")
                .register(meterRegistry);
        this.badActionCounter = Counter.builder("mizan.actions.bad")
                .description("Total bad actions checked")
                .register(meterRegistry);
    }

    @Transactional
    public BalanceDTO toggleAction(Long userId, CheckActionRequest request) {
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Action action = actionRepository.findById(request.getActionId())
                .orElseThrow(() -> new RuntimeException("Action not found"));

        var existing = userDailyActionRepository
                .findByUserIdAndActionIdAndActionDate(userId, request.getActionId(), date);

        if (existing.isPresent()) {
            if (Boolean.FALSE.equals(request.getChecked())) {
                userDailyActionRepository.delete(existing.get());
                log.info("User {} unchecked action {} on {}", userId, action.getNameFr(), date);
            } else {
                existing.get().setChecked(request.getChecked());
                userDailyActionRepository.save(existing.get());
            }
        } else if (Boolean.TRUE.equals(request.getChecked())) {
            UserDailyAction uda = UserDailyAction.builder()
                    .user(user)
                    .action(action)
                    .actionDate(date)
                    .checked(true)
                    .build();
            userDailyActionRepository.save(uda);
            log.info("User {} checked action {} on {}", userId, action.getNameFr(), date);

            // Increment Prometheus counter
            if (action.getType() == Action.ActionType.GOOD) {
                goodActionCounter.increment();
            } else {
                badActionCounter.increment();
            }
        }

        return calculateBalance(userId, date);
    }

    public BalanceDTO getBalance(Long userId, LocalDate date) {
        return calculateBalance(userId, date != null ? date : LocalDate.now());
    }

    public List<BalanceDTO> getHistory(Long userId, LocalDate startDate, LocalDate endDate) {
        return dailyBalanceRepository
                .findByUserIdAndBalanceDateBetweenOrderByBalanceDateDesc(userId, startDate, endDate)
                .stream()
                .map(BalanceDTO::from)
                .collect(Collectors.toList());
    }

    public List<BalanceDTO> getRecentHistory(Long userId) {
        return dailyBalanceRepository.findTop30ByUserIdOrderByBalanceDateDesc(userId)
                .stream()
                .map(BalanceDTO::from)
                .collect(Collectors.toList());
    }

    private BalanceDTO calculateBalance(Long userId, LocalDate date) {
        List<UserDailyAction> actions = userDailyActionRepository.findByUserIdAndActionDate(userId, date);

        int goodCount = 0, badCount = 0, goodWeight = 0, badWeight = 0;

        for (UserDailyAction uda : actions) {
            if (uda.getChecked()) {
                if (uda.getAction().getType() == Action.ActionType.GOOD) {
                    goodCount++;
                    goodWeight += uda.getAction().getWeight();
                } else {
                    badCount++;
                    badWeight += uda.getAction().getWeight();
                }
            }
        }

        String verdict;
        DailyBalance.BalanceVerdict verdictEnum;
        if (goodWeight > badWeight) {
            verdict = "POSITIVE";
            verdictEnum = DailyBalance.BalanceVerdict.POSITIVE;
        } else if (badWeight > goodWeight) {
            verdict = "NEGATIVE";
            verdictEnum = DailyBalance.BalanceVerdict.NEGATIVE;
        } else {
            verdict = "NEUTRAL";
            verdictEnum = DailyBalance.BalanceVerdict.NEUTRAL;
        }

        // Persist daily balance
        DailyBalance balance = dailyBalanceRepository.findByUserIdAndBalanceDate(userId, date)
                .orElse(DailyBalance.builder()
                        .user(userRepository.getReferenceById(userId))
                        .balanceDate(date)
                        .build());
        balance.setGoodCount(goodCount);
        balance.setBadCount(badCount);
        balance.setGoodWeight(goodWeight);
        balance.setBadWeight(badWeight);
        balance.setVerdict(verdictEnum);
        dailyBalanceRepository.save(balance);

        return BalanceDTO.builder()
                .date(date)
                .goodCount(goodCount)
                .badCount(badCount)
                .goodWeight(goodWeight)
                .badWeight(badWeight)
                .verdict(verdict)
                .build();
    }
}
