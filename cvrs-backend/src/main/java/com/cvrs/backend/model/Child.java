package com.cvrs.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private LocalDate dob;

    private String gender;

    private String bloodGroup;

    private Double birthWeight;

    @ManyToOne
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @JsonIgnore
    @OneToMany(mappedBy = "child", cascade = CascadeType.ALL)
    private List<VaccinationSchedule> schedules;

    @Column(name = "is_deleted", columnDefinition = "TINYINT(1) DEFAULT 0")
    private Integer isDeleted = 0; // 0 = false, 1 = true

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (isDeleted == null) {
            isDeleted = 0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for boolean operations
    public boolean isActive() {
        return isDeleted == null || isDeleted == 0;
    }

    public void setDeleted(boolean deleted) {
        this.isDeleted = deleted ? 1 : 0;
    }
}