package com.cvrs.backend.controller;

import com.cvrs.backend.model.Child;
import com.cvrs.backend.service.ChildService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"}, allowCredentials = "true")
public class ChildController {

    @Autowired
    private ChildService childService;

    @PostMapping("/addChildren")
    public ResponseEntity<?> addChild(@RequestBody Child child, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = (String) request.getAttribute("email");

            if (email == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            System.out.println("Adding child for user: " + email);
            System.out.println("Child data: " + child);

            // Validate child data
            if (child.getName() == null || child.getName().trim().isEmpty()) {
                response.put("success", false);
                response.put("message", "Child name is required");
                return ResponseEntity.badRequest().body(response);
            }

            if (child.getDob() == null) {
                response.put("success", false);
                response.put("message", "Date of birth is required");
                return ResponseEntity.badRequest().body(response);
            }

            boolean result = childService.addChild(child, email);

            if (result) {
                response.put("success", true);
                response.put("message", "Child added successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to add child");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error adding child: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @GetMapping("/getChildren")
    public ResponseEntity<?> getChildren(HttpServletRequest request) {
        try {
            String email = (String) request.getAttribute("email");

            if (email == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("success", false, "message", "User not authenticated"));
            }

            System.out.println("Getting children for user: " + email);

            List<Child> children = childService.getChildren(email);

            // Remove circular references by creating a safe DTO
            List<Map<String, Object>> safeChildren = children.stream()
                    .map(child -> {
                        Map<String, Object> safeChild = new HashMap<>();
                        safeChild.put("id", child.getId());
                        safeChild.put("name", child.getName());
                        safeChild.put("dob", child.getDob() != null ? child.getDob().toString() : null);
                        safeChild.put("gender", child.getGender());
                        safeChild.put("bloodGroup", child.getBloodGroup());
                        safeChild.put("birthWeight", child.getBirthWeight());
                        safeChild.put("createdAt", child.getCreatedAt() != null ? child.getCreatedAt().toString() : null);
                        safeChild.put("updatedAt", child.getUpdatedAt() != null ? child.getUpdatedAt().toString() : null);

                        // Add parent info without circular reference
                        if (child.getParent() != null) {
                            Map<String, Object> parentInfo = new HashMap<>();
                            parentInfo.put("id", child.getParent().getId());
                            parentInfo.put("name", child.getParent().getName());
                            parentInfo.put("email", child.getParent().getEmail());
                            safeChild.put("parent", parentInfo);
                        }

                        return safeChild;
                    })
                    .collect(Collectors.toList());

            System.out.println("Returning " + safeChildren.size() + " children");
            return ResponseEntity.ok(safeChildren);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error fetching children: " + e.getMessage()));
        }
    }

    @GetMapping("/getChildren/{id}")
    public ResponseEntity<?> getChild(@PathVariable Long id) {
        try {
            Child child = childService.getChildById(id);
            if (child != null) {
                // Create safe child object without circular references
                Map<String, Object> safeChild = new HashMap<>();
                safeChild.put("id", child.getId());
                safeChild.put("name", child.getName());
                safeChild.put("dob", child.getDob() != null ? child.getDob().toString() : null);
                safeChild.put("gender", child.getGender());
                safeChild.put("bloodGroup", child.getBloodGroup());
                safeChild.put("birthWeight", child.getBirthWeight());
                safeChild.put("createdAt", child.getCreatedAt() != null ? child.getCreatedAt().toString() : null);
                safeChild.put("updatedAt", child.getUpdatedAt() != null ? child.getUpdatedAt().toString() : null);

                // Add parent info without circular reference
                if (child.getParent() != null) {
                    Map<String, Object> parentInfo = new HashMap<>();
                    parentInfo.put("id", child.getParent().getId());
                    parentInfo.put("name", child.getParent().getName());
                    parentInfo.put("email", child.getParent().getEmail());
                    safeChild.put("parent", parentInfo);
                }

                return ResponseEntity.ok(safeChild);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("success", false, "message", "Child not found"));
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error fetching child: " + e.getMessage()));
        }
    }

    @PutMapping("/updateChild/{id}")
    public ResponseEntity<?> updateChild(@PathVariable Long id, @RequestBody Child child, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = (String) request.getAttribute("email");

            if (email == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            Child updatedChild = childService.updateChild(id, child);
            if (updatedChild != null) {
                response.put("success", true);
                response.put("message", "Child updated successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Child not found");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error updating child: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/deleteChild/{id}")
    public ResponseEntity<?> deleteChild(@PathVariable Long id, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = (String) request.getAttribute("email");

            if (email == null) {
                response.put("success", false);
                response.put("message", "User not authenticated");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }

            // Get the child to verify it belongs to the authenticated user
            Child child = childService.getChildById(id);
            if (child == null) {
                response.put("success", false);
                response.put("message", "Child not found or already deleted");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
            }

            // Verify that the child belongs to the authenticated user
            if (!child.getParent().getEmail().equals(email)) {
                response.put("success", false);
                response.put("message", "You don't have permission to delete this child");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            // Use soft delete instead of hard delete
            boolean deleted = childService.softDeleteChild(id);
            if (deleted) {
                response.put("success", true);
                response.put("message", "Child deleted successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Failed to delete child");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error deleting child: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Optional: Add restore endpoint for admin
    @PutMapping("/restoreChild/{id}")
    public ResponseEntity<?> restoreChild(@PathVariable Long id, HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = (String) request.getAttribute("email");
            String role = (String) request.getAttribute("role");

            // Only admin can restore deleted children
            if (!"ADMIN".equals(role)) {
                response.put("success", false);
                response.put("message", "Only admins can restore deleted children");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }

            boolean restored = childService.restoreChild(id);
            if (restored) {
                response.put("success", true);
                response.put("message", "Child restored successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Child not found or not deleted");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Error restoring child: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}