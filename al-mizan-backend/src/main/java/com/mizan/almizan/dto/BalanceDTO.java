package com.mizan.almizan.dto;

import com.mizan.almizan.entity.DailyBalance;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class BalanceDTO {
    private LocalDate date;
    private Integer goodCount;
    private Integer badCount;
    private Integer goodWeight;
    private Integer badWeight;
    private String verdict;
    private List<ActionDTO> checkedActions;

    public static BalanceDTO from(DailyBalance balance) {
        return BalanceDTO.builder()
                .date(balance.getBalanceDate())
                .goodCount(balance.getGoodCount())
                .badCount(balance.getBadCount())
                .goodWeight(balance.getGoodWeight())
                .badWeight(balance.getBadWeight())
                .verdict(balance.getVerdict() != null ? balance.getVerdict().name() : "NEUTRAL")
                .build();
    }
}
