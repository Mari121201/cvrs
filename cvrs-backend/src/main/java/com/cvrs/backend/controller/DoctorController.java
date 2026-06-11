package com.cvrs.backend.controller;

import com.cvrs.backend.model.DoctorAppointment;
import com.cvrs.backend.model.User;
import com.cvrs.backend.repository.DoctorAppointmentRepository;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctor")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DoctorController {

    @Autowired
    private DoctorAppointmentRepository appointmentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @GetMapping("/appointments")
    public ResponseEntity<?> getMyAppointments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User doctor = userRepository.findByEmail(email).orElse(null);

            if (doctor == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Doctor not found"
                ));
            }

            List<DoctorAppointment> appointments = appointmentRepository.findByDoctorIdOrderByAppointmentDateDesc(doctor.getId());

            List<Map<String, Object>> safeAppointments = appointments.stream()
                    .map(apt -> {
                        Map<String, Object> safeApt = new HashMap<>();
                        safeApt.put("id", apt.getId());
                        safeApt.put("appointmentDate", apt.getAppointmentDate());
                        safeApt.put("status", apt.getStatus());
                        safeApt.put("notes", apt.getNotes());

                        if (apt.getChild() != null) {
                            Map<String, Object> childInfo = new HashMap<>();
                            childInfo.put("id", apt.getChild().getId());
                            childInfo.put("name", apt.getChild().getName());

                            if (apt.getChild().getParent() != null) {
                                Map<String, Object> parentInfo = new HashMap<>();
                                parentInfo.put("id", apt.getChild().getParent().getId());
                                parentInfo.put("name", apt.getChild().getParent().getName());
                                childInfo.put("parent", parentInfo);
                            }
                            safeApt.put("child", childInfo);
                        }

                        if (apt.getVaccine() != null) {
                            Map<String, Object> vaccineInfo = new HashMap<>();
                            vaccineInfo.put("id", apt.getVaccine().getId());
                            vaccineInfo.put("name", apt.getVaccine().getName());
                            safeApt.put("vaccine", vaccineInfo);
                        }

                        return safeApt;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(safeAppointments);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch appointments: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/appointments/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        try {
            DoctorAppointment appointment = appointmentRepository.findById(id).orElse(null);
            if (appointment == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Appointment not found"
                ));
            }

            appointment.setStatus(status);
            appointment.setUpdatedAt(LocalDateTime.now());
            appointmentRepository.save(appointment);

            // Notify parent via email
            User parent = appointment.getChild().getParent();
            if ("CONFIRMED".equalsIgnoreCase(status)) {
                emailService.sendAppointmentConfirmedEmail(
                        parent,
                        appointment.getChild().getName(),
                        appointment.getDoctor().getName(),
                        appointment.getVaccine().getName(),
                        appointment.getAppointmentDate(),
                        appointment.getId()
                );
            } else if ("COMPLETED".equalsIgnoreCase(status)) {
                emailService.sendAppointmentConfirmedEmail(
                        parent,
                        appointment.getChild().getName(),
                        appointment.getDoctor().getName(),
                        appointment.getVaccine().getName(),
                        appointment.getAppointmentDate(),
                        appointment.getId()
                );
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment status updated successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update status: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User doctor = userRepository.findByEmail(email).orElse(null);

            if (doctor == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "Doctor not found"
                ));
            }

            List<DoctorAppointment> appointments = appointmentRepository.findByDoctorId(doctor.getId());

            LocalDate today = LocalDate.now();
            long todayCount = appointments.stream()
                    .filter(apt -> apt.getAppointmentDate().toLocalDate().equals(today))
                    .count();

            Map<String, Object> stats = new HashMap<>();
            stats.put("total", appointments.size());
            stats.put("today", todayCount);
            stats.put("pending", appointments.stream().filter(apt -> "PENDING".equals(apt.getStatus())).count());
            stats.put("confirmed", appointments.stream().filter(apt -> "CONFIRMED".equals(apt.getStatus())).count());
            stats.put("completed", appointments.stream().filter(apt -> "COMPLETED".equals(apt.getStatus())).count());
            stats.put("cancelled", appointments.stream().filter(apt -> "CANCELLED".equals(apt.getStatus())).count());

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch stats: " + e.getMessage()
            ));
        }
    }
}