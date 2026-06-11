package com.cvrs.backend.controller;

import com.cvrs.backend.model.User;
import com.cvrs.backend.model.UserSettings;
import com.cvrs.backend.repository.UserRepository;
import com.cvrs.backend.repository.UserSettingsRepository;
import com.cvrs.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class UserSettingsController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSettingsRepository settingsRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            if (user != null) {
                // Create a safe user object without password
                Map<String, Object> safeUser = new HashMap<>();
                safeUser.put("id", user.getId());
                safeUser.put("name", user.getName());
                safeUser.put("email", user.getEmail());
                safeUser.put("phone", user.getPhone());
                safeUser.put("address", user.getAddress());
                safeUser.put("role", user.getRole());

                return ResponseEntity.ok(safeUser);
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error fetching user: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> userData) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "User not found"
                ));
            }

            // Update fields
            if (userData.containsKey("name")) {
                existingUser.setName((String) userData.get("name"));
            }
            if (userData.containsKey("phone")) {
                existingUser.setPhone((String) userData.get("phone"));
            }
            if (userData.containsKey("address")) {
                existingUser.setAddress((String) userData.get("address"));
            }

            User updatedUser = userService.updateUser(id, existingUser);

            // Create safe response
            Map<String, Object> safeUser = new HashMap<>();
            safeUser.put("id", updatedUser.getId());
            safeUser.put("name", updatedUser.getName());
            safeUser.put("email", updatedUser.getEmail());
            safeUser.put("phone", updatedUser.getPhone());
            safeUser.put("address", updatedUser.getAddress());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Profile updated successfully",
                    "user", safeUser
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to update user: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            User user = userService.getUserById(id);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "User not found"
                ));
            }

            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Current password is incorrect"
                ));
            }

            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(id, user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Password changed successfully"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to change password: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/{id}/settings")
    public ResponseEntity<?> getUserSettings(@PathVariable Long id) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "User not found"
                ));
            }

            Optional<UserSettings> existingSettings = settingsRepository.findByUser(user);
            UserSettings settings;

            if (existingSettings.isPresent()) {
                settings = existingSettings.get();
            } else {
                // Create default settings
                settings = new UserSettings();
                settings.setUser(user);
                settings.setDarkMode(false);
                settings.setDashboardLayout("default");
                settings.setEmailNotifications(true);
                settings.setPushNotifications(true);
                settings.setReminderDays(3);
                settings.setWeeklyReport(false);
                settings = settingsRepository.save(settings);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("darkMode", settings.isDarkMode());
            response.put("dashboardLayout", settings.getDashboardLayout());
            response.put("emailNotifications", settings.isEmailNotifications());
            response.put("pushNotifications", settings.isPushNotifications());
            response.put("reminderDays", settings.getReminderDays());
            response.put("weeklyReport", settings.isWeeklyReport());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Error fetching settings: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/{id}/settings")
    public ResponseEntity<?> saveUserSettings(@PathVariable Long id, @RequestBody Map<String, Object> settingsData) {
        try {
            User user = userRepository.findById(id).orElse(null);
            if (user == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "User not found"
                ));
            }

            Optional<UserSettings> existingSettings = settingsRepository.findByUser(user);
            UserSettings settings;

            if (existingSettings.isPresent()) {
                settings = existingSettings.get();
            } else {
                settings = new UserSettings();
                settings.setUser(user);
            }

            // Update settings
            if (settingsData.containsKey("darkMode")) {
                settings.setDarkMode((Boolean) settingsData.get("darkMode"));
            }
            if (settingsData.containsKey("dashboardLayout")) {
                settings.setDashboardLayout((String) settingsData.get("dashboardLayout"));
            }
            if (settingsData.containsKey("emailNotifications")) {
                settings.setEmailNotifications((Boolean) settingsData.get("emailNotifications"));
            }
            if (settingsData.containsKey("pushNotifications")) {
                settings.setPushNotifications((Boolean) settingsData.get("pushNotifications"));
            }
            if (settingsData.containsKey("reminderDays")) {
                settings.setReminderDays((Integer) settingsData.get("reminderDays"));
            }
            if (settingsData.containsKey("weeklyReport")) {
                settings.setWeeklyReport((Boolean) settingsData.get("weeklyReport"));
            }

            settingsRepository.save(settings);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Settings saved successfully"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to save settings: " + e.getMessage()
            ));
        }
    }
}