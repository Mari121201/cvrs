package com.cvrs.backend.dto;

import java.util.List;
import java.util.Map;

public class DashboardStatsDTO {
    // Common stats
    private Long totalParents;
    private Long totalChildren;
    private Long totalDoctors;
    private Long completedVaccinations;
    private Long pendingVaccinations;
    private Long todaySchedules;
    private Long overdueVaccinations;
    private Long totalVaccines;
    private Long totalAppointments;
    private Double revenue;
    private Double growthRate;

    // Doctor-specific stats
    private Long myAppointments;
    private Long myPatients;
    private Integer myCompletionRate;
    private String doctorName;
    private String doctorSpecialization;

    // Chart data
    private List<Map<String, Object>> weeklyStats;
    private List<Map<String, Object>> monthlyStats;
    private List<Map<String, Object>> distributionStats;

    // Getters and Setters
    public Long getTotalParents() {
        return totalParents;
    }

    public void setTotalParents(Long totalParents) {
        this.totalParents = totalParents;
    }

    public Long getTotalChildren() {
        return totalChildren;
    }

    public void setTotalChildren(Long totalChildren) {
        this.totalChildren = totalChildren;
    }

    public Long getTotalDoctors() {
        return totalDoctors;
    }

    public void setTotalDoctors(Long totalDoctors) {
        this.totalDoctors = totalDoctors;
    }

    public Long getCompletedVaccinations() {
        return completedVaccinations;
    }

    public void setCompletedVaccinations(Long completedVaccinations) {
        this.completedVaccinations = completedVaccinations;
    }

    public Long getPendingVaccinations() {
        return pendingVaccinations;
    }

    public void setPendingVaccinations(Long pendingVaccinations) {
        this.pendingVaccinations = pendingVaccinations;
    }

    public Long getTodaySchedules() {
        return todaySchedules;
    }

    public void setTodaySchedules(Long todaySchedules) {
        this.todaySchedules = todaySchedules;
    }

    public Long getOverdueVaccinations() {
        return overdueVaccinations;
    }

    public void setOverdueVaccinations(Long overdueVaccinations) {
        this.overdueVaccinations = overdueVaccinations;
    }

    public Long getTotalVaccines() {
        return totalVaccines;
    }

    public void setTotalVaccines(Long totalVaccines) {
        this.totalVaccines = totalVaccines;
    }

    public Long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(Long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public Double getRevenue() {
        return revenue;
    }

    public void setRevenue(Double revenue) {
        this.revenue = revenue;
    }

    public Double getGrowthRate() {
        return growthRate;
    }

    public void setGrowthRate(Double growthRate) {
        this.growthRate = growthRate;
    }

    public Long getMyAppointments() {
        return myAppointments;
    }

    public void setMyAppointments(Long myAppointments) {
        this.myAppointments = myAppointments;
    }

    public Long getMyPatients() {
        return myPatients;
    }

    public void setMyPatients(Long myPatients) {
        this.myPatients = myPatients;
    }

    public Integer getMyCompletionRate() {
        return myCompletionRate;
    }

    public void setMyCompletionRate(Integer myCompletionRate) {
        this.myCompletionRate = myCompletionRate;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorSpecialization() {
        return doctorSpecialization;
    }

    public void setDoctorSpecialization(String doctorSpecialization) {
        this.doctorSpecialization = doctorSpecialization;
    }

    public List<Map<String, Object>> getWeeklyStats() {
        return weeklyStats;
    }

    public void setWeeklyStats(List<Map<String, Object>> weeklyStats) {
        this.weeklyStats = weeklyStats;
    }

    public List<Map<String, Object>> getMonthlyStats() {
        return monthlyStats;
    }

    public void setMonthlyStats(List<Map<String, Object>> monthlyStats) {
        this.monthlyStats = monthlyStats;
    }

    public List<Map<String, Object>> getDistributionStats() {
        return distributionStats;
    }

    public void setDistributionStats(List<Map<String, Object>> distributionStats) {
        this.distributionStats = distributionStats;
    }
}