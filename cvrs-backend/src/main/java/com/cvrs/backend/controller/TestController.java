package com.cvrs.backend.controller;

import com.cvrs.backend.model.Vaccine;
import com.cvrs.backend.repository.VaccineRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TestController {

    @Autowired
    private VaccineRepository vaccineRepository;

    @GetMapping("/hello")
    public ResponseEntity<?> sayHello() {
        return ResponseEntity.ok(Map.of("message", "CVRS Server runs successfully!"));
    }

    @GetMapping("/secure")
    public ResponseEntity<?> secureTest(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");
        String role = (String) request.getAttribute("role");

        return ResponseEntity.ok(Map.of(
                "message", "Secure API accessed",
                "email", email,
                "role", role
        ));
    }

    @PostMapping("/vaccine")
    public ResponseEntity<?> addVaccine(@RequestBody Vaccine vaccine) {
        vaccineRepository.save(vaccine);
        return ResponseEntity.ok(Map.of("success", true, "message", "Vaccine added successfully"));
    }
}