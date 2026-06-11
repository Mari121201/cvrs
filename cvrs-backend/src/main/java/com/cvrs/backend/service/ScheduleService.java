package com.cvrs.backend.service;

import com.cvrs.backend.model.VaccinationSchedule;
import com.cvrs.backend.repository.VaccineScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ScheduleService {

    @Autowired
    private VaccineScheduleRepository scheduleRepository;

    public List<VaccinationSchedule> getScheduleByChildId(Long childId) {
        return scheduleRepository.findByChildId(childId);
    }

    public VaccinationSchedule markAsCompleted(Long id, String administeredBy, String batchNumber) {
        VaccinationSchedule schedule = scheduleRepository.findById(id).orElse(null);
        if (schedule != null) {
            schedule.setStatus("COMPLETED");
            schedule.setAdministeredDate(LocalDate.now());
            schedule.setAdministeredBy(administeredBy);
            schedule.setBatchNumber(batchNumber);
            return scheduleRepository.save(schedule);
        }
        return null;
    }

    public List<VaccinationSchedule> getAllSchedules() {
        return scheduleRepository.findAll();
    }

    public List<VaccinationSchedule> getPendingSchedules() {
        return scheduleRepository.findAllByStatus("PENDING");
    }

    public List<VaccinationSchedule> getTodaySchedules() {
        LocalDate today = LocalDate.now();
        return scheduleRepository.findByDueDateBetween(today, today.plusDays(1));
    }

    public List<VaccinationSchedule> getOverdueSchedules() {
        return scheduleRepository.findOverdueSchedules(LocalDate.now());
    }

    public List<VaccinationSchedule> getSchedulesByParentId(Long parentId) {
        return scheduleRepository.findByParentId(parentId);
    }

    public long getCompletedCount() {
        return scheduleRepository.countByStatus("COMPLETED");
    }

    public long getPendingCount() {
        return scheduleRepository.countByStatus("PENDING");
    }

    public long getOverdueCount() {
        return scheduleRepository.findOverdueSchedules(LocalDate.now()).size();
    }

    public List<VaccinationSchedule> getSchedulesByDate(LocalDate date) {
        return scheduleRepository.findByDueDateBetween(date, date.plusDays(1));
    }
}