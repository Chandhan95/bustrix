package com.busbooking.service;

import com.busbooking.entity.Booking;
import com.busbooking.entity.User;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendWelcomeEmail(User user) {
        try {
            Context context = new Context();
            context.setVariable("firstName", user.getFirstName());
            context.setVariable("email", user.getEmail());
            context.setVariable("loginUrl", frontendUrl + "/login");

            String htmlContent = templateEngine.process("welcome-email", context);
            sendHtmlEmail(user.getEmail(), "Welcome to BusTix! 🚌", htmlContent);
            log.info("Welcome email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send welcome email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendOtpEmail(User user, String otp) {
        try {
            // Using a simple HTML string to save time, otherwise we'd need a new thymeleaf template
            String htmlContent = "<div style='font-family: Arial, sans-serif; padding: 20px; text-align: center;'>" +
                                 "<h2>Verify Your Email</h2>" +
                                 "<p>Hi " + user.getFirstName() + ",</p>" +
                                 "<p>Thank you for registering on BusTix! Please use the following OTP to verify your email address. This code will expire in 1 hour.</p>" +
                                 "<h1 style='color: #4F46E5; letter-spacing: 5px; font-size: 32px; background: #EEF2FF; padding: 10px; border-radius: 8px; display: inline-block;'>" + otp + "</h1>" +
                                 "<p>If you did not request this, please ignore this email.</p>" +
                                 "</div>";
            sendHtmlEmail(user.getEmail(), "BusTix - Email Verification OTP", htmlContent);
            log.info("OTP email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send OTP email to {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");
            DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

            Context context = new Context();
            context.setVariable("passengerName", booking.getPassengerName());
            context.setVariable("pnrNumber", booking.getPnrNumber());
            context.setVariable("busName", booking.getSchedule().getBus().getBusName());
            context.setVariable("busNumber", booking.getSchedule().getBus().getBusNumber());
            context.setVariable("source", booking.getSchedule().getRoute().getSource());
            context.setVariable("destination", booking.getSchedule().getRoute().getDestination());
            context.setVariable("travelDate", booking.getSchedule().getTravelDate().format(dateFormatter));
            context.setVariable("departureTime", booking.getSchedule().getDepartureTime().format(timeFormatter));
            context.setVariable("arrivalTime", booking.getSchedule().getArrivalTime().format(timeFormatter));
            context.setVariable("seats", String.join(", ", booking.getBookedSeats()));
            context.setVariable("totalAmount", booking.getFinalAmount());
            context.setVariable("qrCode", booking.getQrCodeBase64());
            context.setVariable("viewBookingUrl", frontendUrl + "/bookings/" + booking.getPnrNumber());

            String htmlContent = templateEngine.process("booking-confirmation", context);
            sendHtmlEmail(booking.getPassengerEmail(),
                    "✅ Booking Confirmed - PNR: " + booking.getPnrNumber(), htmlContent);
            log.info("Booking confirmation email sent: PNR={}", booking.getPnrNumber());
        } catch (Exception e) {
            log.error("Failed to send booking confirmation: {}", e.getMessage());
        }
    }

    @Async
    public void sendCancellationEmail(Booking booking) {
        try {
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd MMM yyyy");

            Context context = new Context();
            context.setVariable("passengerName", booking.getPassengerName());
            context.setVariable("pnrNumber", booking.getPnrNumber());
            context.setVariable("source", booking.getSchedule().getRoute().getSource());
            context.setVariable("destination", booking.getSchedule().getRoute().getDestination());
            context.setVariable("travelDate", booking.getSchedule().getTravelDate().format(dateFormatter));
            context.setVariable("refundAmount", booking.getFinalAmount());
            context.setVariable("reason", booking.getCancellationReason());

            String htmlContent = templateEngine.process("cancellation-email", context);
            sendHtmlEmail(booking.getPassengerEmail(),
                    "❌ Booking Cancelled - PNR: " + booking.getPnrNumber(), htmlContent);
            log.info("Cancellation email sent: PNR={}", booking.getPnrNumber());
        } catch (Exception e) {
            log.error("Failed to send cancellation email: {}", e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetEmail(User user, String resetToken) {
        try {
            Context context = new Context();
            context.setVariable("firstName", user.getFirstName());
            context.setVariable("resetLink", frontendUrl + "/reset-password?token=" + resetToken);

            String htmlContent = templateEngine.process("password-reset", context);
            sendHtmlEmail(user.getEmail(), "🔐 Reset Your BusTix Password", htmlContent);
            log.info("Password reset email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to send password reset email: {}", e.getMessage());
        }
    }

    private void sendHtmlEmail(String to, String subject, String htmlContent) throws MessagingException {
        // Save copy to local file for preview
        try {
            java.io.File dir = new java.io.File("../sent_emails");
            if (!dir.exists()) {
                dir.mkdirs();
            }
            String safeSubject = subject.replaceAll("[^a-zA-Z0-9.-]", "_");
            String safeTo = to.replaceAll("[^a-zA-Z0-9.-]", "_");
            String filename = String.format("%d_%s_to_%s.html", System.currentTimeMillis(), safeSubject, safeTo);
            java.io.File file = new java.io.File(dir, filename);
            try (java.io.FileWriter writer = new java.io.FileWriter(file)) {
                writer.write(htmlContent);
            }
            log.info("📧 [LOCAL EMAIL PREVIEW] Email saved: file:///{}", file.getAbsolutePath().replace("\\", "/"));
        } catch (Exception e) {
            log.error("Failed to save local email preview: {}", e.getMessage());
        }

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
