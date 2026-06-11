package com.cvrs.backend.controller;

import com.cvrs.backend.model.User;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.repository.VaccineRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","https://cvrs-brown.vercel.app"})
public class PublicController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @GetMapping("/doctors")
    public ResponseEntity<?> getAllDoctors() {
        try {
            System.out.println("Public endpoint: Fetching all doctors...");
            List<User> doctors = userRepository.findByRole("DOCTOR");

            // Create safe doctor objects without sensitive information
            List<Map<String, Object>> safeDoctors = doctors.stream()
                    .map(doctor -> {
                        Map<String, Object> safeDoctor = new HashMap<>();
                        safeDoctor.put("id", doctor.getId());
                        safeDoctor.put("name", doctor.getName());
                        safeDoctor.put("email", doctor.getEmail());
                        safeDoctor.put("phone", doctor.getPhone());
                        safeDoctor.put("specialization", doctor.getSpecialization());
                        safeDoctor.put("experience", doctor.getExperience());
                        safeDoctor.put("licenseNumber", doctor.getLicenseNumber());
                        return safeDoctor;
                    })
                    .collect(Collectors.toList());

            System.out.println("Found " + safeDoctors.size() + " doctors");
            return ResponseEntity.ok(safeDoctors);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch doctors: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/vaccines")
    public ResponseEntity<?> getAllVaccines() {
        try {
            System.out.println("Public endpoint: Fetching all vaccines...");
            // You'll need to inject VaccineRepository here
            List<com.cvrs.backend.model.Vaccine> vaccines = vaccineRepository.findAll();
            return ResponseEntity.ok(vaccines);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                    "success", false,
                    "message", "Failed to fetch vaccines: " + e.getMessage()
            ));
        }
    }
}