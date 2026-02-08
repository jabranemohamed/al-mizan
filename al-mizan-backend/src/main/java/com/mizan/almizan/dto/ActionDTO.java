package com.mizan.almizan.dto;

import com.mizan.almizan.entity.Action;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ActionDTO {
    private Long id;
    private String nameAr;
    private String nameFr;
    private String nameEn;
    private Action.ActionType type;
    private Integer weight;
    private String category;
    private String icon;
    private Boolean checked; // for daily context

    public static ActionDTO from(Action action) {
        return ActionDTO.builder()
                .id(action.getId())
                .nameAr(action.getNameAr())
                .nameFr(action.getNameFr())
                .nameEn(action.getNameEn())
                .type(action.getType())
                .weight(action.getWeight())
                .category(action.getCategory())
                .icon(action.getIcon())
                .checked(false)
                .build();
    }
}
