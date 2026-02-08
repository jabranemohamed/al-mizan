package com.mizan.almizan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "daily_balances",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "balance_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DailyBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Column(name = "balance_date", nullable = false)
    private LocalDate balanceDate;

    @Column(name = "good_count")
    private Integer goodCount = 0;

    @Column(name = "bad_count")
    private Integer badCount = 0;

    @Column(name = "good_weight")
    private Integer goodWeight = 0;

    @Column(name = "bad_weight")
    private Integer badWeight = 0;

    @Enumerated(EnumType.STRING)
    private BalanceVerdict verdict;

    public enum BalanceVerdict {
        POSITIVE,   // حسنات > سيئات
        NEGATIVE,   // سيئات > حسنات
        NEUTRAL     // تعادل
    }
}
