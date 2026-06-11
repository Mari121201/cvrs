package com.cvrs.backend.controller;

import com.cvrs.backend.dto.LoginResponse;
import com.cvrs.backend.dto.RegisterRequest;
import com.cvrs.backend.model.User;
import com.cvrs.backend.service.EmailService;
import com.cvrs.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173","https://cvrs-brown.vercel.app"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private EmailService emailService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            System.out.println("Received registration request: " + request);

            // Validate required fields
            if (request.getName() == null || request.getName().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Name is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }

            // Create User object from request
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(request.getRole() != null ? request.getRole() : "PARENT");
            user.setPhone(request.getPhone());
            user.setAddress(request.getAddress());

            Map<String, Object> result = userService.registerUser(user);

            if ((boolean) result.get("success")) {
                // Send welcome email asynchronously
                try {
                    emailService.sendWelcomeEmail(user.getEmail(), user.getName(), user);
                } catch (Exception e) {
                    System.err.println("Failed to send welcome email: " + e.getMessage());
                }

                return ResponseEntity.ok(result);
            } else {
                return ResponseEntity.badRequest().body(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Registration failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        try {
            System.out.println("Login attempt for email: " + email);

            if (email == null || email.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Email is required");
                return ResponseEntity.badRequest().body(error);
            }

            if (password == null || password.trim().isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Password is required");
                return ResponseEntity.badRequest().body(error);
            }

            Map<String, Object> result = userService.verifyEmail(email, password);

            if ((boolean) result.get("success")) {
                LoginResponse response = new LoginResponse();
                response.setSuccess(true);
                response.setToken((String) result.get("token"));
                response.setRole((String) result.get("role"));
                response.setName((String) result.get("name"));
                response.setEmail((String) result.get("email"));
                response.setId((Long) result.get("id"));
                response.setPhone((String) result.get("phone"));
                response.setAddress((String) result.get("address"));

                // For DOCTOR role, add doctor-specific fields if available
                if ("DOCTOR".equals(result.get("role"))) {
                    response.setSpecialization((String) result.get("specialization"));
                    response.setLicenseNumber((String) result.get("licenseNumber"));
                    response.setExperience(result.get("experience") != null ?
                            ((Number) result.get("experience")).doubleValue() : null);
                }

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(result);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }


    @GetMapping("/dashboard")
    public ResponseEntity<?> dashboard(@RequestHeader("Authorization") String token) {
        try {
            // Extract token (remove "Bearer " prefix if present)
            String jwtToken = token.startsWith("Bearer ") ? token.substring(7) : token;

            // Validate token and get user info
            Map<String, Object> userInfo = userService.getUserFromToken(jwtToken);

            if (userInfo != null && (boolean) userInfo.get("success")) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Welcome to Dashboard");
                response.put("user", userInfo.get("user"));
                return ResponseEntity.ok(response);
            } else {
                Map<String, Object> error = new HashMap<>();
                error.put("success", false);
                error.put("message", "Invalid or expired token");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("success", false);
            error.put("message", "Dashboard access failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}