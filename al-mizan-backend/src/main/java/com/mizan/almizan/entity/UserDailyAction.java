package com.mizan.almizan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_daily_actions",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "action_id", "action_date"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDailyAction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "action_id", nullable = false)
    private Action action;

    @Column(name = "action_date", nullable = false)
    private LocalDate actionDate;

    @Column(name = "checked")
    private Boolean checked = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
