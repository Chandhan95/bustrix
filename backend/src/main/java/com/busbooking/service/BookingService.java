package com.busbooking.service;

import com.busbooking.dto.request.BookingRequest;
import com.busbooking.dto.response.BookingResponse;
import com.busbooking.entity.*;
import com.busbooking.exception.*;
import com.busbooking.repository.*;
import com.busbooking.util.PnrGenerator;
import com.busbooking.util.QRCodeGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final EmailService emailService;
    private final QRCodeGenerator qrCodeGenerator;

    @Value("${app.booking.cancellation-hours}")
    private int cancellationHours;

    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        log.info("Creating booking for schedule {} by user {}", request.getScheduleId(), userEmail);

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));

        Schedule schedule = scheduleRepository.findById(request.getScheduleId())
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", request.getScheduleId()));

        if (schedule.getAvailableSeats() < request.getSeatNumbers().size()) {
            throw new SeatNotAvailableException("Not enough seats available. Available: " + schedule.getAvailableSeats());
        }

        LocalDateTime departureDateTime = LocalDateTime.of(schedule.getTravelDate(), schedule.getDepartureTime());
        if (LocalDateTime.now().isAfter(departureDateTime)) {
            throw new BookingCancellationException("Cannot book a schedule that has already departed");
        }

        // Validate seats dynamically for this schedule
        validateAndLockSeats(schedule.getId(), request.getSeatNumbers(), user.getId());

        // Calculate amount
        BigDecimal totalAmount = schedule.getPricePerSeat()
                .multiply(BigDecimal.valueOf(request.getSeatNumbers().size()));
        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal finalAmount = totalAmount.subtract(discount);

        // Generate PNR
        String pnr = PnrGenerator.generate();

        // Generate QR Code
        String qrCodeData = String.format("PNR:%s|BUS:%s|FROM:%s|TO:%s|DATE:%s|SEATS:%s",
                pnr, schedule.getBus().getBusNumber(),
                schedule.getRoute().getSource(), schedule.getRoute().getDestination(),
                schedule.getTravelDate(), String.join(",", request.getSeatNumbers()));
        String qrBase64 = null;
        try {
            qrBase64 = qrCodeGenerator.generateQRCodeBase64(qrCodeData, 250, 250);
        } catch (Exception e) {
            log.warn("QR code generation failed: {}", e.getMessage());
        }

        Booking booking = Booking.builder()
                .pnrNumber(pnr)
                .user(user)
                .schedule(schedule)
                .bookedSeats(request.getSeatNumbers())
                .totalAmount(totalAmount)
                .discountAmount(discount)
                .finalAmount(finalAmount)
                .status(Booking.BookingStatus.CONFIRMED)
                .passengerName(request.getPassengerName())
                .passengerEmail(request.getPassengerEmail())
                .passengerPhone(request.getPassengerPhone())
                .couponCode(request.getCouponCode())
                .qrCodeBase64(qrBase64)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Clear the temporary lock on the seats for this schedule
        clearSeatLocks(schedule.getId(), request.getSeatNumbers());

        // Update schedule available seats
        schedule.setAvailableSeats(schedule.getAvailableSeats() - request.getSeatNumbers().size());
        scheduleRepository.save(schedule);

        // Create payment record
        Payment payment = Payment.builder()
                .booking(savedBooking)
                .amount(finalAmount)
                .status(Payment.PaymentStatus.COMPLETED)
                .paymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()))
                .transactionId("TXN-" + System.currentTimeMillis())
                .paidAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        log.info("Booking confirmed: PNR={}, User={}, Seats={}", pnr, userEmail, request.getSeatNumbers());

        // Send confirmation email
        try {
            emailService.sendBookingConfirmationEmail(savedBooking);
        } catch (Exception e) {
            log.warn("Failed to send booking confirmation email: {}", e.getMessage());
        }

        return mapToBookingResponse(savedBooking, payment);
    }

    public BookingResponse cancelBooking(Long bookingId, String reason, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new BookingCancellationException("You can only cancel your own bookings");
        }

        if (booking.getStatus() == Booking.BookingStatus.CANCELLED) {
            throw new BookingCancellationException("Booking is already cancelled");
        }

        LocalDateTime departure = LocalDateTime.of(
                booking.getSchedule().getTravelDate(),
                booking.getSchedule().getDepartureTime()
        );

        if (LocalDateTime.now().isAfter(departure.minusHours(cancellationHours))) {
            throw new BookingCancellationException(
                    "Cannot cancel booking less than " + cancellationHours + " hours before departure");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setCancellationReason(reason);
        booking.setCancelledAt(LocalDateTime.now());
        bookingRepository.save(booking);

        // Seats are automatically freed because this booking is now CANCELLED.
        // No global seat status update is required.

        // Restore available seats
        Schedule schedule = booking.getSchedule();
        schedule.setAvailableSeats(schedule.getAvailableSeats() + booking.getBookedSeats().size());
        scheduleRepository.save(schedule);

        // Update payment for refund
        Payment payment = paymentRepository.findByBookingId(bookingId).orElse(null);
        if (payment != null) {
            payment.setStatus(Payment.PaymentStatus.REFUNDED);
            payment.setRefundAmount(booking.getFinalAmount());
            payment.setRefundedAt(LocalDateTime.now());
            paymentRepository.save(payment);
        }

        log.info("Booking cancelled: PNR={}, Reason={}", booking.getPnrNumber(), reason);

        try {
            emailService.sendCancellationEmail(booking);
        } catch (Exception e) {
            log.warn("Failed to send cancellation email: {}", e.getMessage());
        }

        return mapToBookingResponse(booking, payment);
    }

    public BookingResponse getBookingByPnr(String pnr) {
        Booking booking = bookingRepository.findByPnrNumber(pnr)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "PNR", pnr));
        Payment payment = paymentRepository.findByBookingId(booking.getId()).orElse(null);
        return mapToBookingResponse(booking, payment);
    }

    public Page<BookingResponse> getUserBookings(String userEmail, Pageable pageable) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", userEmail));
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(b -> {
                    Payment p = paymentRepository.findByBookingId(b.getId()).orElse(null);
                    return mapToBookingResponse(b, p);
                });
    }

    private void validateAndLockSeats(Long scheduleId, List<String> seatNumbers, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();
        Long busId = schedule.getBus().getId();
        List<Seat> seats = seatRepository.findByBusIdAndSeatNumbers(busId, seatNumbers);

        if (seats.size() != seatNumbers.size()) {
            throw new SeatNotAvailableException("One or more seats not found");
        }

        List<Booking> activeBookings = bookingRepository.findActiveBookingsByScheduleId(scheduleId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        for (Booking b : activeBookings) bookedSeatNumbers.addAll(b.getBookedSeats());

        for (Seat seat : seats) {
            if (bookedSeatNumbers.contains(seat.getSeatNumber())) {
                throw new SeatNotAvailableException("Seat " + seat.getSeatNumber() + " is already booked for this schedule");
            }
            if (seat.getStatus() == Seat.SeatStatus.LOCKED && seat.isLocked(scheduleId)) {
                if (!userId.equals(seat.getLockedByUserId())) {
                    throw new SeatNotAvailableException("Seat " + seat.getSeatNumber() + " is temporarily locked by another user");
                }
            }
        }
    }

    private void clearSeatLocks(Long scheduleId, List<String> seatNumbers) {
        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow();
        Long busId = schedule.getBus().getId();
        List<Seat> seats = seatRepository.findByBusIdAndSeatNumbers(busId, seatNumbers);
        for (Seat seat : seats) {
            if (seat.getStatus() == Seat.SeatStatus.LOCKED && scheduleId.equals(seat.getLockedScheduleId())) {
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setLockedAt(null);
                seat.setLockedByUserId(null);
                seat.setLockedScheduleId(null);
            }
        }
        seatRepository.saveAll(seats);
    }

    @Scheduled(fixedRate = 300000) // Every 5 minutes
    public void releaseExpiredSeatLocks() {
        LocalDateTime expiredBefore = LocalDateTime.now().minusMinutes(10);
        int released = seatRepository.releaseExpiredLocks(expiredBefore);
        if (released > 0) {
            log.info("Released {} expired seat locks", released);
        }
    }

    private BookingResponse mapToBookingResponse(Booking booking, Payment payment) {
        return BookingResponse.builder()
                .id(booking.getId())
                .pnrNumber(booking.getPnrNumber())
                .passengerName(booking.getPassengerName())
                .passengerEmail(booking.getPassengerEmail())
                .passengerPhone(booking.getPassengerPhone())
                .bookedSeats(booking.getBookedSeats() != null ? new java.util.ArrayList<>(booking.getBookedSeats()) : new java.util.ArrayList<>())
                .busName(booking.getSchedule().getBus().getBusName())
                .busNumber(booking.getSchedule().getBus().getBusNumber())
                .busType(booking.getSchedule().getBus().getBusType().name())
                .source(booking.getSchedule().getRoute().getSource())
                .destination(booking.getSchedule().getRoute().getDestination())
                .travelDate(booking.getSchedule().getTravelDate())
                .departureTime(booking.getSchedule().getDepartureTime())
                .arrivalTime(booking.getSchedule().getArrivalTime())
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .status(booking.getStatus().name())
                .paymentStatus(payment != null ? payment.getStatus().name() : "PENDING")
                .paymentMethod(payment != null ? payment.getPaymentMethod().name() : null)
                .qrCodeBase64(booking.getQrCodeBase64())
                .createdAt(booking.getCreatedAt())
                .cancelledAt(booking.getCancelledAt())
                .cancellationReason(booking.getCancellationReason())
                .build();
    }
}
