package com.cvrs.backend.service;

import com.cvrs.backend.model.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class EmailService {

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    @Value("${brevo.sender.name}")
    private String senderName;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";

    private final DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy");
    private final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("dd MMMM yyyy 'at' hh:mm a");

    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent, User parent, Long scheduleId) {
        try {
            // Build Brevo API request body
            Map<String, Object> sender = new HashMap<>();
            sender.put("name", senderName);
            sender.put("email", senderEmail);

            Map<String, Object> recipient = new HashMap<>();
            recipient.put("email", to);

            Map<String, Object> body = new HashMap<>();
            body.put("sender", sender);
            body.put("to", new Object[]{recipient});
            body.put("replyTo", Map.of("email", "noreply@cvrs.com"));
            body.put("subject", subject);
            body.put("htmlContent", htmlContent);

            HttpHeaders headers = new HttpHeaders();
            headers.set("api-key", brevoApiKey);
            headers.set("accept", "application/json");
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(BREVO_API_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                System.out.println("HTML Email sent successfully to: " + to);
            } else {
                throw new RuntimeException("Brevo API returned status: " + response.getStatusCode());
            }

            // Extract clean message from HTML content
            String cleanMessage = htmlContent.replaceAll("<[^>]*>", " ")
                    .replaceAll("\\s+", " ")
                    .trim();

            if (cleanMessage.length() > 255) {
                cleanMessage = cleanMessage.substring(0, 252) + "...";
            }


        } catch (Exception e) {
            // Log the error but don't save a notification
            System.err.println("Failed to send email to: " + to + " - " + e.getMessage());
            e.printStackTrace();

            // Still save the appointment notification even if email fails
            // This ensures the user still gets the notification in-app
            try {

                String cleanMessage = htmlContent.replaceAll("<[^>]*>", " ")
                        .replaceAll("\\s+", " ")
                        .trim();

                if (cleanMessage.length() > 255) {
                    cleanMessage = cleanMessage.substring(0, 252) + "...";
                }

                System.out.println("Appointment notification saved (email failed but not reported to user)");

            } catch (Exception ex) {
                System.err.println("Failed to save appointment notification: " + ex.getMessage());
            }
        }
    }

    private String getEmailHeader(String title) {
        return "<div style='background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 24px; font-weight: 400; letter-spacing: 0.5px;'>" + title + "</h1>" +
                "</div>";
    }

    private String getEmailFooter() {
        return "<div style='background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; border-top: 1px solid #e9ecef;'>" +
                "<p style='margin: 5px 0; color: #6c757d; font-size: 14px;'>© " + LocalDate.now().getYear() + " CVRS - Children Vaccination Reminder System</p>" +
                "<p style='margin: 5px 0; color: #6c757d; font-size: 12px; font-style: normal;'>This is an automated message. Please do not reply to this email.</p>" +
                "</div>";
    }

    private String getEmailContainer(String content) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<meta charset='UTF-8'>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<meta name='format-detection' content='telephone=no, date=no, address=no, email=no'>" +
                "<meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>" +
                "</head>" +
                "<body style='font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; " +
                "margin: 0; padding: 0; background-color: #f4f6f9; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;'>" +
                "<div style='max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);'>" +
                content +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String getInfoTable(String[][] rows) {
        StringBuilder table = new StringBuilder();
        table.append("<table style='width: 100%; border-collapse: collapse; margin: 25px 0; background-color: #ffffff; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;'>");

        for (int i = 0; i < rows.length; i++) {
            String[] row = rows[i];
            String bgColor = i % 2 == 0 ? "#f8f9fa" : "#ffffff";

            table.append("<tr style='background-color: ").append(bgColor).append(";'>");
            table.append("<td style='padding: 14px 20px; border-bottom: 1px solid #e9ecef; font-weight: 600; color: #495057; width: 40%; vertical-align: middle;'>")
                    .append(row[0]).append("</td>");
            table.append("<td style='padding: 14px 20px; border-bottom: 1px solid #e9ecef; color: #212529; vertical-align: middle;'>")
                    .append(row[1]).append("</td>");
            table.append("</tr>");
        }

        table.append("</table>");
        return table.toString();
    }

    private String getStatusBadge(String status, String type) {
        String bgColor = "";
        String textColor = "";
        String icon = "";

        switch (type.toUpperCase()) {
            case "CONFIRMED":
                bgColor = "#d4edda";
                textColor = "#155724";
                icon = "✓";
                break;
            case "CANCELLED":
                bgColor = "#f8d7da";
                textColor = "#721c24";
                icon = "✗";
                break;
        }

        return "<span style='background-color: " + bgColor + "; color: " + textColor +
                "; padding: 6px 12px; border-radius: 20px; font-weight: 500; font-size: 13px; display: inline-flex; align-items: center; gap: 6px;'>" +
                "<span style='font-size: 14px;'>" + icon + "</span> " + status + "</span>";
    }


    public void sendAppointmentConfirmedEmail(User parent, String childName, String doctorName,
                                              String vaccineName, LocalDateTime appointmentDate, Long appointmentId) {
        String subject = "Appointment Confirmed - CVRS";

        String[][] details = {
                {"Appointment Reference", "<strong style='font-size: 16px; color: #1e3c72;'>#" + appointmentId + "</strong>"},
                {"Child Name", childName},
                {"Consulting Doctor", "Dr. " + doctorName},
                {"Vaccine", vaccineName},
                {"Confirmed Date & Time", appointmentDate.format(dateTimeFormatter)},
                {"Current Status", getStatusBadge("CONFIRMED", "CONFIRMED")}
        };

        String content =
                getEmailHeader("Appointment Confirmed") +
                        "<div style='padding: 30px;'>" +
                        "<p style='font-size: 16px; color: #212529; margin-bottom: 20px;'>Dear <strong>" + parent.getName() + "</strong>,</p>" +
                        "<p style='color: #6c757d; margin-bottom: 25px; line-height: 1.6;'>We are pleased to inform you that your vaccination appointment has been reviewed and confirmed by the doctor. The confirmed details are:</p>" +
                        getInfoTable(details) +
                        "<div style='background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #28a745;'>" +
                        "<p style='margin: 0 0 10px 0; color: #155724; font-weight: 600;'>Important Instructions:</p>" +
                        "<ul style='margin: 0; padding-left: 20px; color: #155724; line-height: 1.6;'>" +
                        "<li>Please arrive at least 15 minutes before your scheduled time</li>" +
                        "</ul>" +
                        "</div>" +
                        "</div>" +
                        getEmailFooter();

        sendHtmlEmail(parent.getEmail(), subject, getEmailContainer(content), parent, null);
    }

    public void sendAppointmentCancelledEmail(User parent, String childName, String doctorName,
                                              String vaccineName, LocalDateTime appointmentDate,
                                              String reason, Long appointmentId) {
        String subject = "Appointment Cancellation Notice - CVRS";

        String[][] details = {
                {"Appointment Reference", "<strong style='font-size: 16px; color: #1e3c72;'>#" + appointmentId + "</strong>"},
                {"Child Name", childName},
                {"Consulting Doctor", "Dr. " + doctorName},
                {"Vaccine", vaccineName},
                {"Original Appointment", appointmentDate.format(dateTimeFormatter)},
                {"Current Status", getStatusBadge("CANCELLED", "CANCELLED")}
        };

        String content =
                getEmailHeader("Appointment Cancellation Notice") +
                        "<div style='padding: 30px;'>" +
                        "<p style='font-size: 16px; color: #212529; margin-bottom: 20px;'>Dear <strong>" + parent.getName() + "</strong>,</p>" +
                        "<p style='color: #6c757d; margin-bottom: 25px; line-height: 1.6;'>This email is to notify you that the following appointment has been cancelled:</p>" +
                        getInfoTable(details) +
                        "<div style='background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #dc3545;'>" +
                        "<p style='margin: 0 0 10px 0; color: #721c24; font-weight: 600;'>Cancellation Details:</p>" +
                        "<p style='margin: 0; color: #721c24; line-height: 1.6;'><strong>Reason:</strong> " + (reason != null ? reason : "Not specified") + "</p>" +
                        "</div>" +
                        "<p style='color: #6c757d; font-size: 14px; line-height: 1.6; margin-bottom: 5px;'>If you wish to reschedule, please visit our portal to book a new appointment.</p>" +
                        "<p style='color: #6c757d; font-size: 14px; line-height: 1.6;'>We apologize for any inconvenience this may cause.</p>" +
                        "</div>" +
                        getEmailFooter();

        sendHtmlEmail(parent.getEmail(), subject, getEmailContainer(content), parent, null);
    }


    public void sendVaccinationReminder(String to, String childName, String vaccineName, LocalDate dueDate, User parent, Long scheduleId) {
        String subject = "Vaccination Reminder - CVRS";

        String[][] details = {
                {"Child Name", childName},
                {"Vaccine Due", vaccineName},
                {"Due Date", dueDate.format(dateFormatter)},
                {"Status", getStatusBadge("PENDING", "PENDING")}
        };

        String content =
                getEmailHeader("Vaccination Reminder") +
                        "<div style='padding: 30px;'>" +
                        "<p style='font-size: 16px; color: #212529; margin-bottom: 20px;'>Dear Parent,</p>" +
                        "<p style='color: #6c757d; margin-bottom: 25px; line-height: 1.6;'>This is a friendly reminder regarding your child's upcoming vaccination:</p>" +
                        getInfoTable(details) +
                        "<div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;'>" +
                        "<p style='margin: 0; color: #856404; line-height: 1.6;'>Please schedule an appointment or visit the vaccination center before the due date to ensure timely vaccination.</p>" +
                        "</div>" +
                        "<p style='color: #6c757d; font-size: 14px; line-height: 1.6;'>If you have already completed this vaccination, please ignore this message.</p>" +
                        "</div>" +
                        getEmailFooter();

        sendHtmlEmail(to, subject, getEmailContainer(content), parent, scheduleId);
    }
    public void sendAppointmentRescheduledEmail(User parent, String childName, String doctorName,
                                                String vaccineName, LocalDateTime newAppointmentDate,
                                                Long appointmentId) {
        String subject = "Appointment Rescheduled - CVRS";

        String[][] details = {
                {"Appointment Reference", "<strong style='font-size: 16px; color: #1e3c72;'>#" + appointmentId + "</strong>"},
                {"Child Name", childName},
                {"Consulting Doctor", "Dr. " + doctorName},
                {"Vaccine", vaccineName},
                {"New Date & Time", newAppointmentDate.format(dateTimeFormatter)},
                {"Current Status", getStatusBadge("CONFIRMED", "CONFIRMED")}
        };

        String content =
                getEmailHeader("Appointment Rescheduled") +
                        "<div style='padding: 30px;'>" +
                        "<p style='font-size: 16px; color: #212529; margin-bottom: 20px;'>Dear <strong>" + parent.getName() + "</strong>,</p>" +
                        "<p style='color: #6c757d; margin-bottom: 25px; line-height: 1.6;'>Your vaccination appointment has been rescheduled. Please find the updated details below:</p>" +
                        getInfoTable(details) +
                        "<div style='background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;'>" +
                        "<p style='margin: 0 0 10px 0; color: #856404; font-weight: 600;'>Important Information:</p>" +
                        "<ul style='margin: 0; padding-left: 20px; color: #856404; line-height: 1.6;'>" +
                        "<li>Please note the new date and time above</li>" +
                        "<li>Arrive at least 15 minutes before your scheduled time</li>" +
                        "<li>If this new time doesn't work for you, please contact us to reschedule again</li>" +
                        "</ul>" +
                        "</div>" +
                        "<p style='color: #6c757d; font-size: 14px; line-height: 1.6;'>Thank you for choosing CVRS for your healthcare needs.</p>" +
                        "</div>" +
                        getEmailFooter();

        sendHtmlEmail(parent.getEmail(), subject, getEmailContainer(content), parent, appointmentId);
    }
    public void sendWelcomeEmail(String to, String name, User parent) {
        String subject = "Welcome to CVRS - Children Vaccination Reminder System";

        String content =
                getEmailHeader("Welcome to CVRS") +
                        "<div style='padding: 30px;'>" +
                        "<p style='font-size: 16px; color: #212529; margin-bottom: 20px;'>Dear <strong>" + name + "</strong>,</p>" +
                        "<p style='color: #6c757d; margin-bottom: 25px; line-height: 1.6;'>Welcome to the Children Vaccination Reminder System (CVRS). Your account has been successfully created.</p>" +

                        "<h3 style='color: #1e3c72; margin: 30px 0 20px 0; font-weight: 500;'>Available Services:</h3>" +

                        "<div style='display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 25px;'>" +
                        "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;'>" +
                        "<div style='font-size: 24px; margin-bottom: 10px; color: #1e3c72;'>👶</div>" +
                        "<h4 style='margin: 0 0 5px 0; color: #495057; font-size: 16px;'>Child Registration</h4>" +
                        "<p style='margin: 0; color: #6c757d; font-size: 13px;'>Register and manage children's profiles</p>" +
                        "</div>" +

                        "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;'>" +
                        "<div style='font-size: 24px; margin-bottom: 10px; color: #1e3c72;'>📅</div>" +
                        "<h4 style='margin: 0 0 5px 0; color: #495057; font-size: 16px;'>Appointment Booking</h4>" +
                        "<p style='margin: 0; color: #6c757d; font-size: 13px;'>Schedule vaccination appointments</p>" +
                        "</div>" +

                        "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;'>" +
                        "<div style='font-size: 24px; margin-bottom: 10px; color: #1e3c72;'>🔔</div>" +
                        "<h4 style='margin: 0 0 5px 0; color: #495057; font-size: 16px;'>Reminders</h4>" +
                        "<p style='margin: 0; color: #6c757d; font-size: 13px;'>Receive timely vaccination reminders</p>" +
                        "</div>" +

                        "<div style='background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #e9ecef;'>" +
                        "<div style='font-size: 24px; margin-bottom: 10px; color: #1e3c72;'>📊</div>" +
                        "<h4 style='margin: 0 0 5px 0; color: #495057; font-size: 16px;'>Track Records</h4>" +
                        "<p style='margin: 0; color: #6c757d; font-size: 13px;'>View vaccination history and reports</p>" +
                        "</div>" +
                        "</div>" +

                        "<div style='background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px solid #dee2e6;'>" +
                        "<p style='margin: 0; color: #1e3c72; font-size: 15px;'>Get started by logging into your account and registering your children.</p>" +
                        "</div>" +

                        "</div>" +
                        getEmailFooter();

        sendHtmlEmail(to, subject, getEmailContainer(content), parent, null);
    }
}