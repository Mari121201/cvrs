package com.cvrs.backend.controller;

import com.cvrs.backend.model.VaccinationSchedule;
import com.cvrs.backend.service.ScheduleService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class ScheduleController {

    @Autowired
    private ScheduleService scheduleService;

    @GetMapping("/schedule/{childId}")
    public ResponseEntity<?> getSchedule(@PathVariable String childId) {
        try {
            // Check if childId is valid
            if (childId == null || childId.equals("undefined") || childId.equals("null")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid child ID"
                ));
            }

            Long id;
            try {
                id = Long.parseLong(childId);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid child ID format"
                ));
            }

            List<VaccinationSchedule> schedules = scheduleService.getScheduleByChildId(id);

            // Create safe DTOs without circular references
            List<Map<String, Object>> safeSchedules = schedules.stream()
                    .map(schedule -> {
                        Map<String, Object> safeSchedule = new HashMap<>();
                        safeSchedule.put("id", schedule.getId());
                        safeSchedule.put("dueDate", schedule.getDueDate() != null ? schedule.getDueDate().toString() : null);
                        safeSchedule.put("administeredDate", schedule.getAdministeredDate() != null ? schedule.getAdministeredDate().toString() : null);
                        safeSchedule.put("status", schedule.getStatus());
                        safeSchedule.put("notes", schedule.getNotes());
                        safeSchedule.put("administeredBy", schedule.getAdministeredBy());
                        safeSchedule.put("batchNumber", schedule.getBatchNumber());
                        safeSchedule.put("reaction", schedule.getReaction());

                        // Add child info without circular reference
                        if (schedule.getChild() != null) {
                            Map<String, Object> childInfo = new HashMap<>();
                            childInfo.put("id", schedule.getChild().getId());
                            childInfo.put("name", schedule.getChild().getName());
                            safeSchedule.put("child", childInfo);
                        }

                        // Add vaccine info
                        if (schedule.getVaccine() != null) {
                            Map<String, Object> vaccineInfo = new HashMap<>();
                            vaccineInfo.put("id", schedule.getVaccine().getId());
                            vaccineInfo.put("name", schedule.getVaccine().getName());
                            vaccineInfo.put("ageInMonths", schedule.getVaccine().getAgeInMonths());
                            safeSchedule.put("vaccine", vaccineInfo);
                        }

                        return safeSchedule;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(safeSchedules);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error fetching schedule: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/schedule/complete/{id}")
    public ResponseEntity<?> markCompleted(@PathVariable String id,
                                           @RequestParam(required = false) String batchNumber,
                                           HttpServletRequest request) {
        try {
            if (id == null || id.equals("undefined") || id.equals("null")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid schedule ID"
                ));
            }

            Long scheduleId;
            try {
                scheduleId = Long.parseLong(id);
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Invalid schedule ID format"
                ));
            }

            String email = (String) request.getAttribute("email");
            VaccinationSchedule schedule = scheduleService.markAsCompleted(scheduleId, email, batchNumber);

            if (schedule != null) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Vaccination marked as completed"
                ));
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Schedule not found"
                ));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Error: " + e.getMessage()
            ));
        }
    }
}