package com.cvrs.backend.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ActivityDTO {
    private Long id;
    private String action;
    private String time;
    private String type; // pending, confirmed, edit, cancelled, completed, info
    private String icon;
    private LocalDateTime timestamp;
}