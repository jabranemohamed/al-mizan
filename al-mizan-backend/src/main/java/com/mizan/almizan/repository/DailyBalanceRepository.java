package com.mizan.almizan.repository;

import com.mizan.almizan.entity.DailyBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyBalanceRepository extends JpaRepository<DailyBalance, Long> {
    Optional<DailyBalance> findByUserIdAndBalanceDate(Long userId, LocalDate date);
    List<DailyBalance> findByUserIdAndBalanceDateBetweenOrderByBalanceDateDesc(
            Long userId, LocalDate startDate, LocalDate endDate);
    List<DailyBalance> findTop30ByUserIdOrderByBalanceDateDesc(Long userId);
}
