package com.cvrs.backend.service;

import com.cvrs.backend.model.Doctor;
import com.cvrs.backend.model.User;
import com.cvrs.backend.repository.DoctorRepository;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    public boolean findByEmail(String email) {
        return userRepository.findByEmail(email).isPresent();
    }

    public Map<String, Object> getUserFromToken(String token) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = jwtUtil.extractEmail(token);

            if (email == null) {
                response.put("success", false);
                response.put("message", "Invalid token");
                return response;
            }

            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "User not found");
                return response;
            }

            User user = userOptional.get();

            // Create a safe user object (without password)
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", user.getId());
            safeUser.put("name", user.getName());
            safeUser.put("email", user.getEmail());
            safeUser.put("role", user.getRole());
            safeUser.put("phone", user.getPhone() != null ? user.getPhone() : "");
            safeUser.put("address", user.getAddress() != null ? user.getAddress() : "");

            // If doctor, add doctor details
            if ("DOCTOR".equals(user.getRole())) {
                Optional<Doctor> doctorOptional = doctorRepository.findByUserId(user.getId());
                if (doctorOptional.isPresent()) {
                    Doctor doctor = doctorOptional.get();
                    safeUser.put("specialization", doctor.getSpecialization());
                    safeUser.put("licenseNumber", doctor.getLicenseNumber());
                    safeUser.put("experience", doctor.getExperience());
                } else {
                    safeUser.put("specialization", user.getSpecialization());
                    safeUser.put("licenseNumber", user.getLicenseNumber());
                    safeUser.put("experience", user.getExperience());
                }
            }

            response.put("success", true);
            response.put("user", safeUser);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Token validation failed: " + e.getMessage());
        }

        return response;
    }

    @Transactional
    public Map<String, Object> registerUser(User user) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Log incoming user data
            System.out.println("Registering user with email: " + user.getEmail());
            System.out.println("Raw password: " + user.getPassword());

            // Check if email already exists
            if (userRepository.existsByEmail(user.getEmail())) {
                response.put("success", false);
                response.put("message", "Email already exists");
                return response;
            }

            // Ensure password is not null
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Password cannot be empty");
                return response;
            }

            // Set default role if not provided
            if (user.getRole() == null || user.getRole().isEmpty()) {
                user.setRole("PARENT");
            }

            // Encode password with BCrypt
            String rawPassword = user.getPassword();
            String encodedPassword = passwordEncoder.encode(rawPassword);
            user.setPassword(encodedPassword);

            // Log for debugging
            System.out.println("Raw password: " + rawPassword);
            System.out.println("Encoded password: " + encodedPassword);
            System.out.println("Matches: " + passwordEncoder.matches(rawPassword, encodedPassword));

            user.setIsDeleted(false);

            // Save user
            User savedUser = userRepository.save(user);

            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("user", savedUser);

        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
        }

        return response;
    }

    public Map<String, Object> verifyEmail(String email, String password) {
        Map<String, Object> response = new HashMap<>();

        try {
            Optional<User> userOptional = userRepository.findByEmail(email);

            if (userOptional.isEmpty()) {
                response.put("success", false);
                response.put("message", "Email is not registered");
                return response;
            }

            User user = userOptional.get();

            if (user.getIsDeleted()) {
                response.put("success", false);
                response.put("message", "Account is deactivated");
                return response;
            }

            boolean passwordMatches = passwordEncoder.matches(password, user.getPassword());

            if (passwordMatches) {
                String token = jwtUtil.generateToken(user.getEmail(), user.getRole());

                response.put("success", true);
                response.put("token", token);
                response.put("role", user.getRole());
                response.put("name", user.getName());
                response.put("email", user.getEmail());
                response.put("id", user.getId());
                response.put("phone", user.getPhone() != null ? user.getPhone() : "");
                response.put("address", user.getAddress() != null ? user.getAddress() : "");

                // Add doctor-specific fields
                if ("DOCTOR".equals(user.getRole())) {
                    response.put("specialization", user.getSpecialization() != null ? user.getSpecialization() : "");
                    response.put("licenseNumber", user.getLicenseNumber() != null ? user.getLicenseNumber() : "");
                    response.put("experience", user.getExperience() != null ? user.getExperience() : 0);
                }

                response.put("message", "Login successful");
            } else {
                response.put("success", false);
                response.put("message", "Invalid password");
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
        }

        return response;
    }


    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElse(null);
    }

    public List<User> getAllParents() {
        return userRepository.findByRole("PARENT");
    }

    public List<User> getAllActiveParents() {
        return userRepository.findAllActiveByRole("PARENT");
    }

    @Transactional
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setName(userDetails.getName());
            user.setPhone(userDetails.getPhone());
            user.setAddress(userDetails.getAddress());
            if (userDetails.getPassword() != null && !userDetails.getPassword().isEmpty()) {
                // Encode new password
                user.setPassword(passwordEncoder.encode(userDetails.getPassword()));
            }
            return userRepository.save(user);
        }
        return null;
    }

    @Transactional
    public boolean deleteUser(Long id) {
        User user = userRepository.findById(id).orElse(null);
        if (user != null) {
            user.setIsDeleted(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public long getParentCount() {
        return userRepository.countByRole("PARENT");
    }
}