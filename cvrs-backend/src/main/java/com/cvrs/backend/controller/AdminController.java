package com.cvrs.backend.controller;

import com.cvrs.backend.dto.ActivityDTO;
import com.cvrs.backend.model.*;
import com.cvrs.backend.repository.*;
import com.cvrs.backend.service.EmailService;
import com.cvrs.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","https://cvrs-brown.vercel.app"})
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserService userService;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private VaccineScheduleRepository scheduleRepository;

    @Autowired
    private DoctorAppointmentRepository appointmentRepository;

    @Autowired
    private EmailService emailService;

    // ==================== DOCTOR APPOINTMENT ENDPOINTS ====================

    @GetMapping("/appointments")
    public ResponseEntity<?> getAllAppointments() {
        try {
            System.out.println("Fetching all doctor appointments...");
            List<DoctorAppointment> appointments = appointmentRepository.findAllByOrderByAppointmentDateDesc();

            List<Map<String, Object>> safeAppointments = appointments.stream()
                    .map(appointment -> {
                        Map<String, Object> safeAppointment = new HashMap<>();
                        safeAppointment.put("id", appointment.getId());
                        safeAppointment.put("appointmentDate", appointment.getAppointmentDate());
                        safeAppointment.put("status", appointment.getStatus());
                        safeAppointment.put("notes", appointment.getNotes());
                        safeAppointment.put("cancellationReason", appointment.getCancellationReason());

                        if (appointment.getChild() != null) {
                            Map<String, Object> childInfo = new HashMap<>();
                            childInfo.put("id", appointment.getChild().getId());
                            childInfo.put("name", appointment.getChild().getName());
                            childInfo.put("dob", appointment.getChild().getDob());

                            if (appointment.getChild().getParent() != null) {
                                Map<String, Object> parentInfo = new HashMap<>();
                                parentInfo.put("id", appointment.getChild().getParent().getId());
                                parentInfo.put("name", appointment.getChild().getParent().getName());
                                parentInfo.put("email", appointment.getChild().getParent().getEmail());
                                childInfo.put("parent", parentInfo);
                            }
                            safeAppointment.put("child", childInfo);
                        }

                        if (appointment.getDoctor() != null) {
                            Map<String, Object> doctorInfo = new HashMap<>();
                            doctorInfo.put("id", appointment.getDoctor().getId());
                            doctorInfo.put("name", appointment.getDoctor().getName());
                            doctorInfo.put("email", appointment.getDoctor().getEmail());
                            doctorInfo.put("specialization", appointment.getDoctor().getSpecialization());
                            safeAppointment.put("doctor", doctorInfo);
                        }

                        if (appointment.getVaccine() != null) {
                            Map<String, Object> vaccineInfo = new HashMap<>();
                            vaccineInfo.put("id", appointment.getVaccine().getId());
                            vaccineInfo.put("name", appointment.getVaccine().getName());
                            vaccineInfo.put("ageInMonths", appointment.getVaccine().getAgeInMonths());
                            safeAppointment.put("vaccine", vaccineInfo);
                        }

                        return safeAppointment;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + safeAppointments.size() + " appointments");
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
            @RequestParam String status,
            @RequestParam(required = false) String cancellationReason) {
        try {
            System.out.println("Admin updating appointment ID: " + id + " to status: " + status);

            DoctorAppointment appointment = appointmentRepository.findById(id).orElse(null);
            if (appointment == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Appointment not found"
                ));
            }

            String oldStatus = appointment.getStatus();

            if (oldStatus.equalsIgnoreCase(status)) {
                return ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Appointment already has status: " + status
                ));
            }

            appointment.setStatus(status);

            if ("CANCELLED".equalsIgnoreCase(status) && cancellationReason != null && !cancellationReason.isEmpty()) {
                appointment.setCancellationReason(cancellationReason);
            }

            appointmentRepository.save(appointment);
            System.out.println("Appointment status updated successfully from " + oldStatus + " to " + status);

            // Send email only for CONFIRMED and CANCELLED status
            User parent = appointment.getChild().getParent();

            try {
                if ("CONFIRMED".equalsIgnoreCase(status)) {
                    emailService.sendAppointmentConfirmedEmail(
                            parent,
                            appointment.getChild().getName(),
                            appointment.getDoctor().getName(),
                            appointment.getVaccine().getName(),
                            appointment.getAppointmentDate(),
                            appointment.getId()
                    );
                    System.out.println("Confirmation email sent to: " + parent.getEmail());

                } else if ("CANCELLED".equalsIgnoreCase(status)) {
                    emailService.sendAppointmentCancelledEmail(
                            parent,
                            appointment.getChild().getName(),
                            appointment.getDoctor().getName(),
                            appointment.getVaccine().getName(),
                            appointment.getAppointmentDate(),
                            cancellationReason != null ? cancellationReason : "Cancelled by administrator",
                            appointment.getId()
                    );
                    System.out.println("Cancellation email sent to: " + parent.getEmail());
                }
            } catch (Exception e) {
                System.err.println("Error sending email notification: " + e.getMessage());
                e.printStackTrace();
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

    @PutMapping("/appointments/{id}/reschedule")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> rescheduleData) {
        try {
            System.out.println("========== RESCHEDULE APPOINTMENT ==========");
            System.out.println("Appointment ID: " + id);
            System.out.println("Reschedule data: " + rescheduleData);

            DoctorAppointment appointment = appointmentRepository.findById(id).orElse(null);
            if (appointment == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Appointment not found"
                ));
            }

            // Only allow rescheduling of confirmed appointments
            if (!"CONFIRMED".equals(appointment.getStatus())) {
                return ResponseEntity.status(400).body(Map.of(
                        "success", false,
                        "message", "Only confirmed appointments can be rescheduled"
                ));
            }

            LocalDateTime newAppointmentDate = null;

            // Parse new appointment date from various possible formats
            if (rescheduleData.containsKey("appointmentDate")) {
                Object dateObj = rescheduleData.get("appointmentDate");
                System.out.println("Date object type: " + dateObj.getClass().getName());
                System.out.println("Date object value: " + dateObj);

                try {
                    // Handle as Integer (timestamp in milliseconds)
                    if (dateObj instanceof Integer) {
                        long timestamp = ((Integer) dateObj).longValue();
                        System.out.println("Parsed as Integer timestamp: " + timestamp);
                        newAppointmentDate = LocalDateTime.ofInstant(
                                java.time.Instant.ofEpochMilli(timestamp),
                                java.time.ZoneId.systemDefault()
                        );
                    }
                    // Handle as Long (timestamp in milliseconds)
                    else if (dateObj instanceof Long) {
                        long timestamp = (Long) dateObj;
                        System.out.println("Parsed as Long timestamp: " + timestamp);
                        newAppointmentDate = LocalDateTime.ofInstant(
                                java.time.Instant.ofEpochMilli(timestamp),
                                java.time.ZoneId.systemDefault()
                        );
                    }

                    else if (dateObj instanceof Double) {
                        long timestamp = ((Double) dateObj).longValue();
                        System.out.println("Parsed as Double timestamp: " + timestamp);
                        newAppointmentDate = LocalDateTime.ofInstant(
                                java.time.Instant.ofEpochMilli(timestamp),
                                java.time.ZoneId.systemDefault()
                        );
                    }
                    // Handle as String (ISO format)
                    else if (dateObj instanceof String) {
                        String dateStr = (String) dateObj;
                        System.out.println("Raw date string: " + dateStr);

                        // Remove 'Z' if present (UTC indicator)
                        if (dateStr.endsWith("Z")) {
                            dateStr = dateStr.substring(0, dateStr.length() - 1);
                        }

                        // Try parsing with timezone offset
                        try {
                            newAppointmentDate = LocalDateTime.parse(dateStr);
                        } catch (Exception e) {
                            // Try with DateTimeFormatter if simple parse fails
                            java.time.format.DateTimeFormatter formatter =
                                    java.time.format.DateTimeFormatter.ISO_DATE_TIME;
                            newAppointmentDate = LocalDateTime.parse(dateStr, formatter);
                        }
                    }

                    System.out.println("Parsed new appointment date: " + newAppointmentDate);
                    System.out.println("Hour: " + newAppointmentDate.getHour());
                    System.out.println("Minute: " + newAppointmentDate.getMinute());

                } catch (Exception e) {
                    System.err.println("Error parsing date: " + e.getMessage());
                    e.printStackTrace();
                    return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Invalid date format: " + e.getMessage()
                    ));
                }

                // Check if new date is in the past
                if (newAppointmentDate.isBefore(LocalDateTime.now())) {
                    return ResponseEntity.badRequest().body(Map.of(
                            "success", false,
                            "message", "Appointment date cannot be in the past"
                    ));
                }

                // Update the appointment date
                appointment.setAppointmentDate(newAppointmentDate);
            }

            // Update notes if provided
            if (rescheduleData.containsKey("notes")) {
                appointment.setNotes(rescheduleData.get("notes").toString());
            }

            // Save the updated appointment
            appointmentRepository.save(appointment);
            System.out.println("Appointment rescheduled successfully with time: " +
                    appointment.getAppointmentDate().getHour() + ":" +
                    String.format("%02d", appointment.getAppointmentDate().getMinute()));

            // Send email notification to parent about rescheduling
            User parent = appointment.getChild().getParent();

            try {
                emailService.sendAppointmentRescheduledEmail(
                        parent,
                        appointment.getChild().getName(),
                        appointment.getDoctor().getName(),
                        appointment.getVaccine().getName(),
                        newAppointmentDate != null ? newAppointmentDate : appointment.getAppointmentDate(),
                        appointment.getId()
                );
                System.out.println("Reschedule email sent to: " + parent.getEmail());
            } catch (Exception e) {
                System.err.println("Error sending reschedule email: " + e.getMessage());
                e.printStackTrace();
                // Don't fail the request if email fails
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Appointment rescheduled successfully",
                    "newDateTime", newAppointmentDate.toString()
            ));

        } catch (Exception e) {
            System.err.println("========== ERROR RESCHEDULING APPOINTMENT ==========");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to reschedule appointment: " + e.getMessage()
            ));
        }
    }

    // ==================== DOCTOR MANAGEMENT ENDPOINTS ====================

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            List<User> doctors = userRepository.findByRole("DOCTOR");

            List<Map<String, Object>> safeDoctors = doctors.stream()
                    .map(doctor -> {
                        Map<String, Object> safeDoctor = new HashMap<>();
                        safeDoctor.put("id", doctor.getId());
                        safeDoctor.put("name", doctor.getName());
                        safeDoctor.put("email", doctor.getEmail());
                        safeDoctor.put("phone", doctor.getPhone());
                        safeDoctor.put("address", doctor.getAddress());
                        safeDoctor.put("role", doctor.getRole());
                        safeDoctor.put("specialization", doctor.getSpecialization());
                        safeDoctor.put("licenseNumber", doctor.getLicenseNumber());
                        safeDoctor.put("experience", doctor.getExperience());
                        safeDoctor.put("createdAt", doctor.getCreatedAt());
                        return safeDoctor;
                    })
                    .collect(Collectors.toList());

            return ResponseEntity.ok(safeDoctors);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch doctors: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/doctors")
    public ResponseEntity<?> addDoctor(@RequestBody Map<String, Object> doctorData) {
        try {
            if (!doctorData.containsKey("name") || !doctorData.containsKey("email") || !doctorData.containsKey("password")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Name, email and password are required"
                ));
            }

            if (userRepository.existsByEmail((String) doctorData.get("email"))) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Email already exists"
                ));
            }

            User doctor = new User();
            doctor.setName((String) doctorData.get("name"));
            doctor.setEmail((String) doctorData.get("email"));
            doctor.setPassword(passwordEncoder.encode((String) doctorData.get("password")));
            doctor.setRole("DOCTOR");

            if (doctorData.containsKey("phone")) {
                doctor.setPhone((String) doctorData.get("phone"));
            }
            if (doctorData.containsKey("address")) {
                doctor.setAddress((String) doctorData.get("address"));
            }
            if (doctorData.containsKey("specialization")) {
                doctor.setSpecialization((String) doctorData.get("specialization"));
            }
            if (doctorData.containsKey("licenseNumber")) {
                doctor.setLicenseNumber((String) doctorData.get("licenseNumber"));
            }

            // Handle experience as Double to support decimal values
            if (doctorData.containsKey("experience")) {
                Object expObj = doctorData.get("experience");
                if (expObj instanceof Double) {
                    doctor.setExperience((Double) expObj);
                } else if (expObj instanceof Integer) {
                    doctor.setExperience(((Integer) expObj).doubleValue());
                } else if (expObj instanceof String) {
                    try {
                        doctor.setExperience(Double.parseDouble((String) expObj));
                    } catch (NumberFormatException e) {
                        doctor.setExperience(0.0);
                    }
                }
            }

            doctor.setIsDeleted(false);

            User savedDoctor = userRepository.save(doctor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor added successfully",
                    "id", savedDoctor.getId()
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to add doctor: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/doctors/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @RequestBody Map<String, Object> doctorData) {
        try {
            User doctor = userService.getUserById(id);
            if (doctor == null || !"DOCTOR".equals(doctor.getRole())) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Doctor not found"
                ));
            }

            if (doctorData.containsKey("name")) {
                doctor.setName((String) doctorData.get("name"));
            }
            if (doctorData.containsKey("phone")) {
                doctor.setPhone((String) doctorData.get("phone"));
            }
            if (doctorData.containsKey("address")) {
                doctor.setAddress((String) doctorData.get("address"));
            }
            if (doctorData.containsKey("specialization")) {
                doctor.setSpecialization((String) doctorData.get("specialization"));
            }
            if (doctorData.containsKey("licenseNumber")) {
                doctor.setLicenseNumber((String) doctorData.get("licenseNumber"));
            }

            // Handle experience as Double to support decimal values
            if (doctorData.containsKey("experience")) {
                Object expObj = doctorData.get("experience");
                if (expObj instanceof Double) {
                    doctor.setExperience((Double) expObj);
                } else if (expObj instanceof Integer) {
                    doctor.setExperience(((Integer) expObj).doubleValue());
                } else if (expObj instanceof String) {
                    try {
                        doctor.setExperience(Double.parseDouble((String) expObj));
                    } catch (NumberFormatException e) {
                        doctor.setExperience(0.0);
                    }
                }
            }

            if (doctorData.containsKey("password") && doctorData.get("password") != null) {
                String password = (String) doctorData.get("password");
                if (!password.isEmpty()) {
                    doctor.setPassword(passwordEncoder.encode(password));
                }
            }

            userRepository.save(doctor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor updated successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update doctor: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/doctors/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id) {
        try {
            User doctor = userService.getUserById(id);
            if (doctor == null || !"DOCTOR".equals(doctor.getRole())) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Doctor not found"
                ));
            }

            doctor.setIsDeleted(true);
            userRepository.save(doctor);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Doctor deleted successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to delete doctor: " + e.getMessage()
            ));
        }
    }

    // ==================== VACCINE MANAGEMENT ENDPOINTS ====================

    @GetMapping("/vaccines")
    public ResponseEntity<?> getAllVaccines() {
        try {
            List<Vaccine> vaccines = vaccineRepository.findAll();
            return ResponseEntity.ok(vaccines);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch vaccines: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/vaccines")
    public ResponseEntity<?> addVaccine(@RequestBody Map<String, Object> vaccineData) {
        try {
            if (!vaccineData.containsKey("name") || !vaccineData.containsKey("ageInMonths")) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Name and ageInMonths are required"
                ));
            }

            String name = (String) vaccineData.get("name");
            if (vaccineRepository.existsByName(name)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Vaccine with this name already exists"
                ));
            }

            Vaccine vaccine = new Vaccine();
            vaccine.setName(name);

            Object ageObj = vaccineData.get("ageInMonths");
            if (ageObj instanceof Integer) {
                vaccine.setAgeInMonths((Integer) ageObj);
            } else if (ageObj instanceof String) {
                vaccine.setAgeInMonths(Integer.parseInt((String) ageObj));
            }

            vaccineRepository.save(vaccine);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Vaccine added successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to add vaccine: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/vaccines/{id}")
    public ResponseEntity<?> updateVaccine(@PathVariable Long id, @RequestBody Map<String, Object> vaccineData) {
        try {
            Vaccine vaccine = vaccineRepository.findById(id).orElse(null);
            if (vaccine == null) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Vaccine not found"
                ));
            }

            if (vaccineData.containsKey("name")) {
                vaccine.setName((String) vaccineData.get("name"));
            }

            if (vaccineData.containsKey("ageInMonths")) {
                Object ageObj = vaccineData.get("ageInMonths");
                if (ageObj instanceof Integer) {
                    vaccine.setAgeInMonths((Integer) ageObj);
                } else if (ageObj instanceof String) {
                    vaccine.setAgeInMonths(Integer.parseInt((String) ageObj));
                }
            }

            vaccineRepository.save(vaccine);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Vaccine updated successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to update vaccine: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/vaccines/{id}")
    public ResponseEntity<?> deleteVaccine(@PathVariable Long id) {
        try {
            if (!vaccineRepository.existsById(id)) {
                return ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Vaccine not found"
                ));
            }

            vaccineRepository.deleteById(id);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Vaccine deleted successfully"
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to delete vaccine: " + e.getMessage()
            ));
        }
    }

    // ==================== ACTIVITIES ENDPOINTS ====================

    @GetMapping("/activities/recent")
    public ResponseEntity<?> getRecentActivities() {
        try {
            List<ActivityDTO> activities = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();

            // 1. Get recent appointment requests (PENDING)
            List<DoctorAppointment> pendingAppointments = appointmentRepository.findTop5ByStatusOrderByCreatedAtDesc("PENDING");
            for (DoctorAppointment apt : pendingAppointments) {
                ActivityDTO activity = new ActivityDTO();
                activity.setId(apt.getId());
                activity.setAction(String.format("New appointment request for %s with Dr. %s",
                        apt.getChild().getName(),
                        apt.getDoctor().getName()));
                activity.setTime(getTimeAgo(apt.getCreatedAt()));
                activity.setType("pending");
                activity.setIcon("📅");
                activity.setTimestamp(apt.getCreatedAt());
                activities.add(activity);
            }

            // 2. Get recent confirmed appointments
            List<DoctorAppointment> confirmedAppointments = appointmentRepository.findTop5ByStatusOrderByUpdatedAtDesc("CONFIRMED");
            for (DoctorAppointment apt : confirmedAppointments) {
                ActivityDTO activity = new ActivityDTO();
                activity.setId(apt.getId());
                activity.setAction(String.format("Appointment confirmed for %s with Dr. %s",
                        apt.getChild().getName(),
                        apt.getDoctor().getName()));
                activity.setTime(getTimeAgo(apt.getUpdatedAt() != null ? apt.getUpdatedAt() : apt.getCreatedAt()));
                activity.setType("confirmed");
                activity.setIcon("✓");
                activity.setTimestamp(apt.getUpdatedAt() != null ? apt.getUpdatedAt() : apt.getCreatedAt());
                activities.add(activity);
            }

            // 3. Get recent rescheduled appointments (look for notes indicating reschedule)
            List<DoctorAppointment> recentAppointments = appointmentRepository.findTop10ByOrderByUpdatedAtDesc();
            for (DoctorAppointment apt : recentAppointments) {
                // Check if this was rescheduled (you might need a separate field for this)
                if (apt.getNotes() != null && apt.getNotes().toLowerCase().contains("reschedule")) {
                    ActivityDTO activity = new ActivityDTO();
                    activity.setId(apt.getId());
                    activity.setAction(String.format("Appointment rescheduled for %s with Dr. %s",
                            apt.getChild().getName(),
                            apt.getDoctor().getName()));
                    activity.setTime(getTimeAgo(apt.getUpdatedAt()));
                    activity.setType("edit");
                    activity.setIcon("✎");
                    activity.setTimestamp(apt.getUpdatedAt());
                    activities.add(activity);
                }
            }

            // 4. Get recent cancelled appointments
            List<DoctorAppointment> cancelledAppointments = appointmentRepository.findTop5ByStatusOrderByUpdatedAtDesc("CANCELLED");
            for (DoctorAppointment apt : cancelledAppointments) {
                ActivityDTO activity = new ActivityDTO();
                activity.setId(apt.getId());
                String reason = apt.getCancellationReason() != null ? " - Reason: " + apt.getCancellationReason() : "";
                activity.setAction(String.format("Appointment cancelled for %s with Dr. %s%s",
                        apt.getChild().getName(),
                        apt.getDoctor().getName(),
                        reason));
                activity.setTime(getTimeAgo(apt.getUpdatedAt()));
                activity.setType("cancelled");
                activity.setIcon("✗");
                activity.setTimestamp(apt.getUpdatedAt());
                activities.add(activity);
            }

            // 5. Get recent completed vaccinations (from vaccination_schedule)
            List<VaccinationSchedule> completedVaccinations = scheduleRepository.findTop5ByStatusOrderByAdministeredDateDesc("COMPLETED");
            for (VaccinationSchedule schedule : completedVaccinations) {
                if (schedule.getAdministeredDate() != null) {
                    ActivityDTO activity = new ActivityDTO();
                    activity.setId(schedule.getId());
                    activity.setAction(String.format("Vaccination completed for %s - %s",
                            schedule.getChild().getName(),
                            schedule.getVaccine().getName()));
                    activity.setTime(getTimeAgo(schedule.getAdministeredDate().atStartOfDay()));
                    activity.setType("completed");
                    activity.setIcon("✓");
                    activity.setTimestamp(schedule.getAdministeredDate().atStartOfDay());
                    activities.add(activity);
                }
            }

            // 6. Get new doctor registrations
            List<User> newDoctors = userRepository.findTop5ByRoleOrderByCreatedAtDesc("DOCTOR");
            for (User doctor : newDoctors) {
                ActivityDTO activity = new ActivityDTO();
                activity.setId(doctor.getId());
                activity.setAction(String.format("New doctor joined: Dr. %s (%s)",
                        doctor.getName(),
                        doctor.getSpecialization() != null ? doctor.getSpecialization() : "General Physician"));
                activity.setTime(getTimeAgo(doctor.getCreatedAt()));
                activity.setType("info");
                activity.setIcon("👨‍⚕️");
                activity.setTimestamp(doctor.getCreatedAt());
                activities.add(activity);
            }

            // 7. Get new parent registrations
            List<User> newParents = userRepository.findTop5ByRoleOrderByCreatedAtDesc("PARENT");
            for (User parent : newParents) {
                ActivityDTO activity = new ActivityDTO();
                activity.setId(parent.getId());
                activity.setAction(String.format("New parent registered: %s", parent.getName()));
                activity.setTime(getTimeAgo(parent.getCreatedAt()));
                activity.setType("info");
                activity.setIcon("👤");
                activity.setTimestamp(parent.getCreatedAt());
                activities.add(activity);
            }

            // Sort all activities by timestamp (most recent first)
            activities.sort((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()));

            // Limit to 15 most recent activities
            List<ActivityDTO> recentActivities = activities.stream().limit(15).collect(Collectors.toList());

            return ResponseEntity.ok(recentActivities);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch activities: " + e.getMessage()
            ));
        }
    }

    private String getTimeAgo(LocalDateTime dateTime) {
        if (dateTime == null) return "Unknown";

        LocalDateTime now = LocalDateTime.now();
        long minutes = java.time.Duration.between(dateTime, now).toMinutes();

        if (minutes < 1) return "Just now";
        if (minutes < 60) return minutes + " minutes ago";
        if (minutes < 120) return "1 hour ago";
        if (minutes < 1440) return (minutes / 60) + " hours ago";
        if (minutes < 2880) return "Yesterday";
        return (minutes / 1440) + " days ago";
    }
}