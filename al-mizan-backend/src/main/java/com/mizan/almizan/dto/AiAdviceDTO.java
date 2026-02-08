package com.mizan.almizan.dto;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class AiAdviceDTO {
    private String advice;
    private String encouragement;
    private String hadithReference;
}
