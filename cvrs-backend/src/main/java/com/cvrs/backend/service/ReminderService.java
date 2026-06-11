package com.cvrs.backend.service;

import com.cvrs.backend.model.VaccinationSchedule;
import com.cvrs.backend.repository.VaccineScheduleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReminderService {

    @Autowired
    private VaccineScheduleRepository scheduleRepository;

    @Autowired
    private EmailService emailService;

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendDailyReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        List<VaccinationSchedule> schedules = scheduleRepository.findPendingSchedulesByDueDate(tomorrow);

        for (VaccinationSchedule schedule : schedules) {
            try {
                String parentEmail = schedule.getChild().getParent().getEmail();
                String childName = schedule.getChild().getName();
                String vaccineName = schedule.getVaccine().getName();
                LocalDate dueDate = schedule.getDueDate();

                emailService.sendVaccinationReminder(
                        parentEmail,
                        childName,
                        vaccineName,
                        dueDate,
                        schedule.getChild().getParent(),
                        schedule.getId()
                );

                System.out.println("Reminder sent to: " + parentEmail + " for " + childName);

                // Add a small delay to avoid overwhelming the mail server
                Thread.sleep(1000);

            } catch (Exception e) {
                System.err.println("Failed to send reminder for schedule ID: " + schedule.getId());
                e.printStackTrace();
            }
        }
    }

    // Run every day at 10 AM to check for overdue vaccinations
    @Scheduled(cron = "0 0 10 * * ?")
    public void updateOverdueStatus() {
        LocalDate today = LocalDate.now();
        List<VaccinationSchedule> overdueSchedules = scheduleRepository.findOverdueSchedules(today);

        for (VaccinationSchedule schedule : overdueSchedules) {
            if (!"COMPLETED".equals(schedule.getStatus())) {
                schedule.setStatus("OVERDUE");
                scheduleRepository.save(schedule);
            }
        }

        System.out.println("Updated " + overdueSchedules.size() + " overdue schedules");
    }

    // Run every Monday at 8 AM for weekly summary
    @Scheduled(cron = "0 0 8 * * MON")
    public void sendWeeklySummary() {
        LocalDate startOfWeek = LocalDate.now().minusDays(7);
        LocalDate endOfWeek = LocalDate.now();

        List<VaccinationSchedule> weeklySchedules = scheduleRepository.findByDueDateBetween(startOfWeek, endOfWeek);

        // Group by parent and send summary
        // This is a simplified version - you might want to implement grouping logic
        System.out.println("Weekly summary: " + weeklySchedules.size() + " vaccinations this week");
    }
}