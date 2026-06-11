package com.cvrs.backend.controller;

import com.cvrs.backend.dto.DashboardStatsDTO;
import com.cvrs.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/dashboard/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR')")
    public ResponseEntity<?> getDashboardStats() {
        try {
            System.out.println("========== DASHBOARD STATS REQUEST ==========");
            System.out.println("Fetching dashboard stats...");

            DashboardStatsDTO stats = dashboardService.getDashboardStats();

            System.out.println("Dashboard stats fetched successfully");
            System.out.println("Stats: " + stats);

            return ResponseEntity.ok(stats);

        } catch (Exception e) {
            System.err.println("========== ERROR FETCHING DASHBOARD STATS ==========");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Error fetching dashboard stats: " + e.getMessage());
            error.put("errorType", e.getClass().getSimpleName());

            return ResponseEntity.status(500).body(error);
        }
    }
}