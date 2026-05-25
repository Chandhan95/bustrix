package com.busbooking.controller;

import com.busbooking.dto.request.BookingRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.BookingResponse;
import com.busbooking.service.BookingService;
import com.busbooking.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;
    private final SeatService seatService;

    @PostMapping
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        BookingResponse booking = bookingService.createBooking(request, authentication.getName());
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Booking confirmed successfully!", booking));
    }

    @GetMapping("/my")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Page<BookingResponse>>> getMyBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Authentication authentication) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingResponse> bookings = bookingService.getUserBookings(
                authentication.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success("Bookings fetched", bookings));
    }

    @GetMapping("/pnr/{pnr}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> getBookingByPnr(
            @PathVariable String pnr) {
        BookingResponse booking = bookingService.getBookingByPnr(pnr);
        return ResponseEntity.ok(ApiResponse.success("Booking fetched", booking));
    }

    @PostMapping("/{bookingId}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @PathVariable Long bookingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String reason = body.getOrDefault("reason", "Cancelled by user");
        BookingResponse booking = bookingService.cancelBooking(
                bookingId, reason, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", booking));
    }

    @PostMapping("/seats/lock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> lockSeats(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Long scheduleId = Long.valueOf(body.get("scheduleId").toString());
        @SuppressWarnings("unchecked")
        List<String> seatNumbers = (List<String>) body.get("seatNumbers");
        Long userId = Long.valueOf(body.get("userId").toString());
        seatService.lockSeats(scheduleId, seatNumbers, userId);
        return ResponseEntity.ok(ApiResponse.success("Seats locked for 10 minutes", null));
    }

    @PostMapping("/seats/unlock")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> unlockSeats(
            @RequestBody Map<String, Object> body,
            Authentication authentication) {
        Long scheduleId = Long.valueOf(body.get("scheduleId").toString());
        @SuppressWarnings("unchecked")
        List<String> seatNumbers = (List<String>) body.get("seatNumbers");
        Long userId = Long.valueOf(body.get("userId").toString());
        seatService.unlockSeats(scheduleId, seatNumbers, userId);
        return ResponseEntity.ok(ApiResponse.success("Seats unlocked", null));
    }
}
