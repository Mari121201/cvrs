package com.cvrs.backend.controller;

import com.cvrs.backend.model.Vaccine;
import com.cvrs.backend.service.VaccineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VaccineController {

    @Autowired
    private VaccineService vaccineService;

    @GetMapping("/vaccines")
    public ResponseEntity<?> getAllVaccines() {
        List<Vaccine> vaccines = vaccineService.getAllVaccines();
        return ResponseEntity.ok(vaccines);
    }

    @GetMapping("/vaccines/{id}")
    public ResponseEntity<?> getVaccine(@PathVariable Long id) {
        Vaccine vaccine = vaccineService.getVaccineById(id);
        if (vaccine != null) {
            return ResponseEntity.ok(vaccine);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/vaccines/by-age/{age}")
    public ResponseEntity<?> getVaccinesByAge(@PathVariable int age) {
        return ResponseEntity.ok(vaccineService.getVaccinesByAge(age));
    }

    @GetMapping("/vaccines/upcoming/{currentAge}")
    public ResponseEntity<?> getUpcomingVaccines(@PathVariable int currentAge) {
        return ResponseEntity.ok(vaccineService.getUpcomingVaccines(currentAge));
    }
}