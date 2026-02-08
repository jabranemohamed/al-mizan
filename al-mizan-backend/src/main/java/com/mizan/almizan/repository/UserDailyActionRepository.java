package com.mizan.almizan.repository;

import com.mizan.almizan.entity.UserDailyAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserDailyActionRepository extends JpaRepository<UserDailyAction, Long> {

    List<UserDailyAction> findByUserIdAndActionDate(Long userId, LocalDate date);

    Optional<UserDailyAction> findByUserIdAndActionIdAndActionDate(Long userId, Long actionId, LocalDate date);

    @Query("SELECT COUNT(uda) FROM UserDailyAction uda WHERE uda.user.id = :userId " +
           "AND uda.actionDate = :date AND uda.action.type = :type AND uda.checked = true")
    Integer countByUserAndDateAndType(@Param("userId") Long userId,
                                      @Param("date") LocalDate date,
                                      @Param("type") com.mizan.almizan.entity.Action.ActionType type);

    @Query("SELECT uda FROM UserDailyAction uda WHERE uda.user.id = :userId " +
           "AND uda.actionDate BETWEEN :startDate AND :endDate AND uda.checked = true")
    List<UserDailyAction> findByUserIdAndDateRange(@Param("userId") Long userId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    void deleteByUserIdAndActionIdAndActionDate(Long userId, Long actionId, LocalDate date);
}
