package com.cvrs.backend.controller;

import com.cvrs.backend.model.*;
import com.cvrs.backend.repository.*;
import com.cvrs.backend.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","https://cvrs-brown.vercel.app"})
public class AppointmentController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;


    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private DoctorAppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;



    @PostMapping("/book")
    public ResponseEntity<?> bookAppointment(@RequestBody Map<String, Object> bookingData) {
        try {
            System.out.println("Booking appointment with data: " + bookingData);

            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User parent = userRepository.findByEmail(email).orElse(null);

            if (parent == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "User not authenticated"
                ));
            }

            // Validate required fields
            if (!bookingData.containsKey("childId") || !bookingData.containsKey("doctorId") ||
                    !bookingData.containsKey("vaccineId") || !bookingData.containsKey("appointmentDate")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Missing required fields"
                ));
            }

            Long childId = Long.parseLong(bookingData.get("childId").toString());
            Long doctorId = Long.parseLong(bookingData.get("doctorId").toString());
            Long vaccineId = Long.parseLong(bookingData.get("vaccineId").toString());

            Child child = childRepository.findById(childId).orElse(null);
            User doctor = userRepository.findById(doctorId).orElse(null);
            Vaccine vaccine = vaccineRepository.findById(vaccineId).orElse(null);

            if (child == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Child not found"
                ));
            }

            // Ensure child has parent set
            if (child.getParent() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Child has no parent associated"
                ));
            }

            if (doctor == null || !"DOCTOR".equals(doctor.getRole())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Doctor not found"
                ));
            }

            if (vaccine == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Vaccine not found"
                ));
            }

            // Verify that the child belongs to the parent
            if (!child.getParent().getId().equals(parent.getId())) {
                return ResponseEntity.status(403).body(Map.of(
                        "success", false,
                        "message", "You can only book for your own children"
                ));
            }

            LocalDateTime appointmentDate = LocalDateTime.parse(bookingData.get("appointmentDate").toString().replace("Z", ""));

            // Check for duplicate
            LocalDateTime startOfDay = appointmentDate.toLocalDate().atStartOfDay();
            LocalDateTime endOfDay = appointmentDate.toLocalDate().atTime(LocalTime.MAX);

            List<DoctorAppointment> existing = appointmentRepository
                    .findByChildIdAndDateRange(childId, startOfDay, endOfDay);

            if (!existing.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Child already has an appointment on this date"
                ));
            }

            DoctorAppointment appointment = new DoctorAppointment();
            appointment.setChild(child);
            appointment.setDoctor(doctor);
            appointment.setVaccine(vaccine);
            appointment.setAppointmentDate(appointmentDate);
            appointment.setStatus("PENDING");

            if (bookingData.containsKey("notes")) {
                appointment.setNotes((String) bookingData.get("notes"));
            }

            DoctorAppointment savedAppointment = appointmentRepository.save(appointment);

            // Refresh the appointment to ensure all relationships are loaded
            savedAppointment = appointmentRepository.findById(savedAppointment.getId()).orElse(savedAppointment);

            System.out.println("Appointment saved with ID: " + savedAppointment.getId());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment booked successfully",
                    "id", savedAppointment.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to book appointment: " + e.getMessage()
            ));
        }
    }
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateAppointmentStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String cancellationReason) {
        try {
            DoctorAppointment appointment = appointmentRepository.findById(id).orElse(null);

            if (appointment == null) {
                return ResponseEntity.notFound().build();
            }

            String oldStatus = appointment.getStatus();
            appointment.setStatus(status);

            if ("CANCELLED".equals(status) && cancellationReason != null) {
                appointment.setCancellationReason(cancellationReason);
            }

            appointmentRepository.save(appointment);

            // Send email notification based on status change
            User parent = appointment.getChild().getParent();

            if ("CONFIRMED".equals(status) && !"CONFIRMED".equals(oldStatus)) {
                sendAppointmentConfirmedEmail(parent, appointment);
            } else if ("CANCELLED".equals(status) && !"CANCELLED".equals(oldStatus)) {
                sendAppointmentCancelledEmail(parent, appointment, cancellationReason);
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment status updated successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update appointment status: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/my")
    public ResponseEntity<?> getMyAppointments() {
        try {
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            User parent = userRepository.findByEmail(email).orElse(null);

            if (parent == null) {
                return ResponseEntity.status(401).body(Map.of(
                        "success", false,
                        "message", "User not authenticated"
                ));
            }

            // Get all children of this parent
            List<Child> children = childRepository.findByParentAndIsDeletedFalse(parent);
            List<Long> childIds = children.stream().map(Child::getId).collect(Collectors.toList());

            // Get appointments for these children
            List<DoctorAppointment> appointments = appointmentRepository.findByChildIdInOrderByAppointmentDateDesc(childIds);

            // Create safe response objects
            List<Map<String, Object>> safeAppointments = appointments.stream()
                    .map(apt -> {
                        Map<String, Object> safeApt = new HashMap<>();
                        safeApt.put("id", apt.getId());
                        safeApt.put("appointmentDate", apt.getAppointmentDate());
                        safeApt.put("status", apt.getStatus());
                        safeApt.put("notes", apt.getNotes());
                        safeApt.put("cancellationReason", apt.getCancellationReason());

                        Map<String, Object> childInfo = new HashMap<>();
                        childInfo.put("id", apt.getChild().getId());
                        childInfo.put("name", apt.getChild().getName());
                        safeApt.put("child", childInfo);

                        Map<String, Object> doctorInfo = new HashMap<>();
                        doctorInfo.put("id", apt.getDoctor().getId());
                        doctorInfo.put("name", apt.getDoctor().getName());
                        doctorInfo.put("specialization", apt.getDoctor().getSpecialization());
                        safeApt.put("doctor", doctorInfo);

                        Map<String, Object> vaccineInfo = new HashMap<>();
                        vaccineInfo.put("id", apt.getVaccine().getId());
                        vaccineInfo.put("name", apt.getVaccine().getName());
                        safeApt.put("vaccine", vaccineInfo);

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

    // Email notification methods


    private void sendAppointmentConfirmedEmail(User parent, DoctorAppointment appointment) {
        emailService.sendAppointmentConfirmedEmail(
                parent,
                appointment.getChild().getName(),
                appointment.getDoctor().getName(),
                appointment.getVaccine().getName(),
                appointment.getAppointmentDate(),
                appointment.getId()
        );
    }

    private void sendAppointmentCancelledEmail(User parent, DoctorAppointment appointment, String reason) {
        emailService.sendAppointmentCancelledEmail(
                parent,
                appointment.getChild().getName(),
                appointment.getDoctor().getName(),
                appointment.getVaccine().getName(),
                appointment.getAppointmentDate(),
                reason,
                appointment.getId()
        );
    }
}