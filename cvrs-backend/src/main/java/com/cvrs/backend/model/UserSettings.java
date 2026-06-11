package com.cvrs.backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "user_settings")
public class UserSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "dark_mode", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer darkMode = 0; // 0 = false, 1 = true

    @Column(name = "dashboard_layout", length = 20)
    private String dashboardLayout = "default";

    @Column(name = "email_notifications", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Integer emailNotifications = 1;

    @Column(name = "push_notifications", columnDefinition = "TINYINT(1) DEFAULT 1")
    private Integer pushNotifications = 1;

    @Column(name = "reminder_days")
    private Integer reminderDays = 3;

    @Column(name = "weekly_report", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer weeklyReport = 0;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods
    public boolean isDarkMode() {
        return darkMode != null && darkMode == 1;
    }

    public void setDarkMode(boolean enabled) {
        this.darkMode = enabled ? 1 : 0;
    }

    public boolean isEmailNotifications() {
        return emailNotifications != null && emailNotifications == 1;
    }

    public void setEmailNotifications(boolean enabled) {
        this.emailNotifications = enabled ? 1 : 0;
    }

    public boolean isPushNotifications() {
        return pushNotifications != null && pushNotifications == 1;
    }

    public void setPushNotifications(boolean enabled) {
        this.pushNotifications = enabled ? 1 : 0;
    }

    public boolean isWeeklyReport() {
        return weeklyReport != null && weeklyReport == 1;
    }

    public void setWeeklyReport(boolean enabled) {
        this.weeklyReport = enabled ? 1 : 0;
    }
}