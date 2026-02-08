package com.mizan.almizan.dto;

import lombok.*;
import java.time.LocalDate;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CheckActionRequest {
    private Long actionId;
    private LocalDate date;
    private Boolean checked;
}
