package com.mizan.almizan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "actions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Action {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nameAr;

    @Column(nullable = false)
    private String nameFr;

    @Column(nullable = false)
    private String nameEn;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActionType type;

    @Column(nullable = false)
    private Integer weight = 1;

    @Column
    private String category;

    @Column
    private String icon;

    @Column(nullable = false)
    private Boolean active = true;

    public enum ActionType {
        GOOD,  // حسنات
        BAD    // سيئات
    }
}
