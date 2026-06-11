package com.cvrs.backend.service;

import com.cvrs.backend.dto.DashboardStatsDTO;
import com.cvrs.backend.model.User;
import com.cvrs.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private VaccineRepository vaccineRepository;

    @Autowired
    private DoctorAppointmentRepository appointmentRepository;

    @Autowired
    private VaccineScheduleRepository scheduleRepository;

    public DashboardStatsDTO getDashboardStats() {
        System.out.println("========== DASHBOARD SERVICE ==========");

        try {
            // Get current user from security context
            String email = SecurityContextHolder.getContext().getAuthentication().getName();
            System.out.println("Current user email: " + email);

            User currentUser = userRepository.findByEmail(email).orElse(null);

            if (currentUser == null) {
                System.err.println("User not found for email: " + email);
                return createEmptyStats();
            }

            System.out.println("User found: " + currentUser.getName() + ", Role: " + currentUser.getRole());

            String role = currentUser.getRole();
            Long userId = currentUser.getId();

            DashboardStatsDTO stats = new DashboardStatsDTO();

            // Common stats for both Admin and Doctor
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            LocalDateTime endOfDay = startOfDay.plusDays(1);

            // Get today's schedules
            try {
                Long todaySchedules = appointmentRepository.countByAppointmentDateBetween(startOfDay, endOfDay);
                stats.setTodaySchedules(todaySchedules != null ? todaySchedules : 0L);
                System.out.println("Today schedules: " + stats.getTodaySchedules());
            } catch (Exception e) {
                System.err.println("Error counting today schedules: " + e.getMessage());
                stats.setTodaySchedules(0L);
            }

            // Get total appointments
            try {
                Long totalAppointments = appointmentRepository.count();
                stats.setTotalAppointments(totalAppointments != null ? totalAppointments : 0L);
                System.out.println("Total appointments: " + stats.getTotalAppointments());
            } catch (Exception e) {
                System.err.println("Error counting total appointments: " + e.getMessage());
                stats.setTotalAppointments(0L);
            }

            // Get vaccine stats
            try {
                Long totalVaccines = vaccineRepository.count();
                stats.setTotalVaccines(totalVaccines != null ? totalVaccines : 0L);
                System.out.println("Total vaccines: " + stats.getTotalVaccines());
            } catch (Exception e) {
                System.err.println("Error counting vaccines: " + e.getMessage());
                stats.setTotalVaccines(0L);
            }

            try {
                Long completedVaccinations = scheduleRepository.countByStatus("COMPLETED");
                stats.setCompletedVaccinations(completedVaccinations != null ? completedVaccinations : 0L);
                System.out.println("Completed vaccinations: " + stats.getCompletedVaccinations());
            } catch (Exception e) {
                System.err.println("Error counting completed vaccinations: " + e.getMessage());
                stats.setCompletedVaccinations(0L);
            }

            try {
                Long pendingVaccinations = scheduleRepository.countByStatus("PENDING");
                stats.setPendingVaccinations(pendingVaccinations != null ? pendingVaccinations : 0L);
                System.out.println("Pending vaccinations: " + stats.getPendingVaccinations());
            } catch (Exception e) {
                System.err.println("Error counting pending vaccinations: " + e.getMessage());
                stats.setPendingVaccinations(0L);
            }

            try {
                Long overdueVaccinations = scheduleRepository.countOverdueSchedules(LocalDate.now());
                stats.setOverdueVaccinations(overdueVaccinations != null ? overdueVaccinations : 0L);
                System.out.println("Overdue vaccinations: " + stats.getOverdueVaccinations());
            } catch (Exception e) {
                System.err.println("Error counting overdue vaccinations: " + e.getMessage());
                stats.setOverdueVaccinations(0L);
            }

            // If user is ADMIN, return full system stats
            if ("ADMIN".equals(role)) {
                System.out.println("Fetching admin-specific stats");

                try {
                    Long totalParents = userRepository.countByRole("PARENT");
                    stats.setTotalParents(totalParents != null ? totalParents : 0L);
                    System.out.println("Total parents: " + stats.getTotalParents());
                } catch (Exception e) {
                    System.err.println("Error counting parents: " + e.getMessage());
                    stats.setTotalParents(0L);
                }

                try {
                    Long totalChildren = childRepository.count();
                    stats.setTotalChildren(totalChildren != null ? totalChildren : 0L);
                    System.out.println("Total children: " + stats.getTotalChildren());
                } catch (Exception e) {
                    System.err.println("Error counting children: " + e.getMessage());
                    stats.setTotalChildren(0L);
                }

                try {
                    Long totalDoctors = userRepository.countByRole("DOCTOR");
                    stats.setTotalDoctors(totalDoctors != null ? totalDoctors : 0L);
                    System.out.println("Total doctors: " + stats.getTotalDoctors());
                } catch (Exception e) {
                    System.err.println("Error counting doctors: " + e.getMessage());
                    stats.setTotalDoctors(0L);
                }

                // Calculate revenue (example)
                stats.setRevenue(stats.getCompletedVaccinations() * 10.0);

                // Calculate growth rate
                stats.setGrowthRate(calculateGrowthRate());

            }
            // If user is DOCTOR, return doctor-specific stats
            else if ("DOCTOR".equals(role)) {
                System.out.println("Fetching doctor-specific stats for user ID: " + userId);

                // Get doctor's personal stats
                try {
                    Long myAppointments = appointmentRepository.countByDoctorId(userId);
                    stats.setMyAppointments(myAppointments != null ? myAppointments : 0L);
                    System.out.println("My appointments: " + stats.getMyAppointments());
                } catch (Exception e) {
                    System.err.println("Error counting doctor appointments: " + e.getMessage());
                    stats.setMyAppointments(0L);
                }

                try {
                    Long myPatients = appointmentRepository.countDistinctPatientsByDoctorId(userId);
                    stats.setMyPatients(myPatients != null ? myPatients : 0L);
                    System.out.println("My patients: " + stats.getMyPatients());
                } catch (Exception e) {
                    System.err.println("Error counting doctor patients: " + e.getMessage());
                    stats.setMyPatients(0L);
                }

                // Calculate doctor's completion rate
                try {
                    Long myCompleted = appointmentRepository.countByDoctorIdAndStatus(userId, "COMPLETED");
                    if (stats.getMyAppointments() > 0) {
                        int completionRate = (int) ((myCompleted * 100) / stats.getMyAppointments());
                        stats.setMyCompletionRate(completionRate);
                    } else {
                        stats.setMyCompletionRate(0);
                    }
                    System.out.println("My completion rate: " + stats.getMyCompletionRate());
                } catch (Exception e) {
                    System.err.println("Error calculating completion rate: " + e.getMessage());
                    stats.setMyCompletionRate(0);
                }

                stats.setDoctorName(currentUser.getName() != null ? currentUser.getName() : "");
                stats.setDoctorSpecialization(currentUser.getSpecialization() != null ?
                        currentUser.getSpecialization() : "General Physician");

                // Set admin-only stats to 0 for doctors
                stats.setTotalParents(0L);
                stats.setTotalChildren(0L);
                stats.setTotalDoctors(0L);
                stats.setRevenue(0.0);
                stats.setGrowthRate(0.0);
            }

            // Generate weekly stats
            try {
                stats.setWeeklyStats(generateWeeklyStats(role, userId));
                System.out.println("Weekly stats generated");
            } catch (Exception e) {
                System.err.println("Error generating weekly stats: " + e.getMessage());
                stats.setWeeklyStats(new ArrayList<>());
            }

            // Generate monthly stats
            try {
                stats.setMonthlyStats(generateMonthlyStats(role, userId));
                System.out.println("Monthly stats generated");
            } catch (Exception e) {
                System.err.println("Error generating monthly stats: " + e.getMessage());
                stats.setMonthlyStats(new ArrayList<>());
            }

            // Generate distribution stats
            try {
                stats.setDistributionStats(generateDistributionStats());
                System.out.println("Distribution stats generated");
            } catch (Exception e) {
                System.err.println("Error generating distribution stats: " + e.getMessage());
                stats.setDistributionStats(new ArrayList<>());
            }

            System.out.println("========== DASHBOARD SERVICE COMPLETED ==========");
            return stats;

        } catch (Exception e) {
            System.err.println("========== FATAL ERROR IN DASHBOARD SERVICE ==========");
            System.err.println("Error type: " + e.getClass().getName());
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();

            return createEmptyStats();
        }
    }

    private DashboardStatsDTO createEmptyStats() {
        DashboardStatsDTO fallbackStats = new DashboardStatsDTO();
        fallbackStats.setTotalParents(0L);
        fallbackStats.setTotalChildren(0L);
        fallbackStats.setTotalDoctors(0L);
        fallbackStats.setCompletedVaccinations(0L);
        fallbackStats.setPendingVaccinations(0L);
        fallbackStats.setTodaySchedules(0L);
        fallbackStats.setOverdueVaccinations(0L);
        fallbackStats.setTotalVaccines(0L);
        fallbackStats.setTotalAppointments(0L);
        fallbackStats.setRevenue(0.0);
        fallbackStats.setGrowthRate(0.0);
        fallbackStats.setMyAppointments(0L);
        fallbackStats.setMyPatients(0L);
        fallbackStats.setMyCompletionRate(0);
        fallbackStats.setDoctorName("");
        fallbackStats.setDoctorSpecialization("");
        fallbackStats.setWeeklyStats(new ArrayList<>());
        fallbackStats.setMonthlyStats(new ArrayList<>());
        fallbackStats.setDistributionStats(new ArrayList<>());

        return fallbackStats;
    }

    private List<Map<String, Object>> generateWeeklyStats(String role, Long userId) {
        List<Map<String, Object>> weeklyStats = new ArrayList<>();

        String[] days = {"Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"};
        LocalDate startOfWeek = LocalDate.now().with(DayOfWeek.MONDAY);

        for (int i = 0; i < days.length; i++) {
            Map<String, Object> dayStat = new HashMap<>();
            dayStat.put("day", days[i]);

            LocalDate date = startOfWeek.plusDays(i);
            LocalDateTime dayStart = date.atStartOfDay();
            LocalDateTime dayEnd = date.atTime(LocalTime.MAX);

            try {
                if ("ADMIN".equals(role)) {
                    Long appointments = appointmentRepository.countByAppointmentDateBetween(dayStart, dayEnd);
                    Long vaccinations = scheduleRepository.countCompletedByDateRange(dayStart, dayEnd);

                    dayStat.put("appointments", appointments != null ? appointments : 0L);
                    dayStat.put("vaccinations", vaccinations != null ? vaccinations : 0L);
                } else {
                    Long doctorAppointments = appointmentRepository.countByDoctorIdAndDateBetween(
                            userId, dayStart, dayEnd);
                    dayStat.put("appointments", doctorAppointments != null ? doctorAppointments : 0L);
                    dayStat.put("vaccinations", 0L);
                }
            } catch (Exception e) {
                System.err.println("Error generating weekly stat for day " + days[i] + ": " + e.getMessage());
                dayStat.put("appointments", 0L);
                dayStat.put("vaccinations", 0L);
            }

            weeklyStats.add(dayStat);
        }

        return weeklyStats;
    }

    private List<Map<String, Object>> generateMonthlyStats(String role, Long userId) {
        List<Map<String, Object>> monthlyStats = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

        LocalDate now = LocalDate.now();
        int currentYear = now.getYear();

        for (int i = 0; i < 12; i++) {
            Map<String, Object> monthStat = new HashMap<>();
            monthStat.put("month", months[i]);

            try {
                LocalDate startDate = LocalDate.of(currentYear, i + 1, 1);
                LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

                if ("ADMIN".equals(role)) {
                    Long vaccinations = scheduleRepository.countCompletedBetweenDates(startDate, endDate);
                    Long children = childRepository.countByCreatedAtBetween(
                            startDate.atStartOfDay(),
                            endDate.atTime(LocalTime.MAX)
                    );

                    monthStat.put("vaccinations", vaccinations != null ? vaccinations : 0L);
                    monthStat.put("children", children != null ? children : 0L);
                } else {
                    Long doctorAppointments = appointmentRepository.countByDoctorIdAndDateBetween(
                            userId,
                            startDate.atStartOfDay(),
                            endDate.atTime(LocalTime.MAX)
                    );
                    monthStat.put("vaccinations", doctorAppointments != null ? doctorAppointments : 0L);
                }
            } catch (Exception e) {
                System.err.println("Error generating monthly stat for month " + months[i] + ": " + e.getMessage());
                monthStat.put("vaccinations", 0L);
                monthStat.put("children", 0L);
            }

            monthlyStats.add(monthStat);
        }

        return monthlyStats;
    }

    private List<Map<String, Object>> generateDistributionStats() {
        List<Map<String, Object>> distribution = new ArrayList<>();

        try {
            Long completed = scheduleRepository.countByStatus("COMPLETED");
            Long pending = scheduleRepository.countByStatus("PENDING");
            Long overdue = scheduleRepository.countOverdueSchedules(LocalDate.now());

            Map<String, Object> completedMap = new HashMap<>();
            completedMap.put("name", "Completed");
            completedMap.put("value", completed != null ? completed : 0L);
            distribution.add(completedMap);

            Map<String, Object> pendingMap = new HashMap<>();
            pendingMap.put("name", "Pending");
            pendingMap.put("value", pending != null ? pending : 0L);
            distribution.add(pendingMap);

            Map<String, Object> overdueMap = new HashMap<>();
            overdueMap.put("name", "Overdue");
            overdueMap.put("value", overdue != null ? overdue : 0L);
            distribution.add(overdueMap);
        } catch (Exception e) {
            System.err.println("Error generating distribution stats: " + e.getMessage());
            // Add default values
            Map<String, Object> completedMap = new HashMap<>();
            completedMap.put("name", "Completed");
            completedMap.put("value", 0L);
            distribution.add(completedMap);

            Map<String, Object> pendingMap = new HashMap<>();
            pendingMap.put("name", "Pending");
            pendingMap.put("value", 0L);
            distribution.add(pendingMap);

            Map<String, Object> overdueMap = new HashMap<>();
            overdueMap.put("name", "Overdue");
            overdueMap.put("value", 0L);
            distribution.add(overdueMap);
        }

        return distribution;
    }

    private Double calculateGrowthRate() {
        try {
            LocalDate now = LocalDate.now();
            LocalDate startOfCurrentMonth = now.withDayOfMonth(1);
            LocalDate startOfPreviousMonth = startOfCurrentMonth.minusMonths(1);
            LocalDate endOfPreviousMonth = startOfCurrentMonth.minusDays(1);

            Long currentMonthCompleted = scheduleRepository.countCompletedBetweenDates(
                    startOfCurrentMonth, now);
            Long previousMonthCompleted = scheduleRepository.countCompletedBetweenDates(
                    startOfPreviousMonth, endOfPreviousMonth);

            if (previousMonthCompleted != null && previousMonthCompleted > 0) {
                return ((double) (currentMonthCompleted - previousMonthCompleted) / previousMonthCompleted) * 100;
            }
        } catch (Exception e) {
            System.err.println("Error calculating growth rate: " + e.getMessage());
        }
        return 10.0;
    }
}