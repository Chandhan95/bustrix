package com.busbooking.service;

import com.busbooking.dto.response.SeatResponse;
import com.busbooking.entity.Seat;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.exception.SeatNotAvailableException;
import com.busbooking.entity.Schedule;
import com.busbooking.entity.Booking;
import com.busbooking.repository.BusRepository;
import com.busbooking.repository.BookingRepository;
import com.busbooking.repository.ScheduleRepository;
import com.busbooking.repository.SeatRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class SeatService {

    private final SeatRepository seatRepository;
    private final BusRepository busRepository;
    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;

    public List<SeatResponse> getSeatsForSchedule(Long scheduleId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", scheduleId));
        
        List<Seat> physicalSeats = seatRepository.findByBusIdOrderBySeatNumber(schedule.getBus().getId());
        
        // Find all booked seats for this schedule
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByScheduleId(scheduleId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        for (Booking b : activeBookings) {
            bookedSeatNumbers.addAll(b.getBookedSeats());
        }

        return physicalSeats.stream().map(seat -> {
            SeatResponse response = mapToSeatResponse(seat);
            // Override status and locks for this specific schedule
            if (bookedSeatNumbers.contains(seat.getSeatNumber())) {
                response.setStatus(Seat.SeatStatus.BOOKED.name());
                response.setLocked(false);
            } else if (seat.getStatus() == Seat.SeatStatus.LOCKED && seat.isLocked(scheduleId)) {
                response.setStatus(Seat.SeatStatus.LOCKED.name());
                response.setLocked(true);
            } else {
                response.setStatus(Seat.SeatStatus.AVAILABLE.name());
                response.setLocked(false);
            }
            return response;
        }).collect(Collectors.toList());
    }

    public List<SeatResponse> getSeatsByBus(Long busId) {
        List<Seat> physicalSeats = seatRepository.findByBusIdOrderBySeatNumber(busId);
        return physicalSeats.stream()
                .map(this::mapToSeatResponse)
                .collect(Collectors.toList());
    }

    public void lockSeats(Long scheduleId, List<String> seatNumbers, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", scheduleId));
        Long busId = schedule.getBus().getId();

        List<Seat> seats = seatRepository.findByBusIdAndSeatNumbers(busId, seatNumbers);
        if (seats.size() != seatNumbers.size()) {
            throw new SeatNotAvailableException("One or more seats not found for bus " + busId);
        }

        // Check if any seat is already booked on this schedule
        List<Booking> activeBookings = bookingRepository.findActiveBookingsByScheduleId(scheduleId);
        List<String> bookedSeatNumbers = new ArrayList<>();
        for (Booking b : activeBookings) bookedSeatNumbers.addAll(b.getBookedSeats());

        for (Seat seat : seats) {
            if (bookedSeatNumbers.contains(seat.getSeatNumber())) {
                throw new SeatNotAvailableException("Seat " + seat.getSeatNumber() + " is already booked for this schedule");
            }
            if (seat.getStatus() == Seat.SeatStatus.LOCKED && seat.isLocked(scheduleId)) {
                throw new SeatNotAvailableException("Seat " + seat.getSeatNumber() + " is currently locked by another user");
            }
            seat.setStatus(Seat.SeatStatus.LOCKED);
            seat.setLockedAt(LocalDateTime.now());
            seat.setLockedByUserId(userId);
            seat.setLockedScheduleId(scheduleId);
        }
        seatRepository.saveAll(seats);
        log.info("Locked {} seats for schedule {} by user {}", seatNumbers.size(), scheduleId, userId);
    }

    public void unlockSeats(Long scheduleId, List<String> seatNumbers, Long userId) {
        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResourceNotFoundException("Schedule", "id", scheduleId));
        Long busId = schedule.getBus().getId();

        List<Seat> seats = seatRepository.findByBusIdAndSeatNumbers(busId, seatNumbers);
        for (Seat seat : seats) {
            if (seat.getStatus() == Seat.SeatStatus.LOCKED &&
                    userId.equals(seat.getLockedByUserId()) &&
                    scheduleId.equals(seat.getLockedScheduleId())) {
                seat.setStatus(Seat.SeatStatus.AVAILABLE);
                seat.setLockedAt(null);
                seat.setLockedByUserId(null);
                seat.setLockedScheduleId(null);
            }
        }
        seatRepository.saveAll(seats);
        log.info("Unlocked {} seats for schedule {}", seatNumbers.size(), scheduleId);
    }

    public void initializeSeatsForBus(Long busId, int totalSeats) {
        var bus = busRepository.findById(busId)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", busId));

        List<Seat> seats = new ArrayList<>();
        char[] rows = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'};
        int seatsPerRow = 4;
        int seatCount = 0;

        for (char row : rows) {
            for (int col = 1; col <= seatsPerRow; col++) {
                if (seatCount >= totalSeats) break;
                String seatNumber = row + String.valueOf(col);
                Seat.SeatType seatType;
                if (col == 1 || col == 4) seatType = Seat.SeatType.WINDOW;
                else if (col == 2) seatType = Seat.SeatType.AISLE;
                else seatType = Seat.SeatType.MIDDLE;

                seats.add(Seat.builder()
                        .bus(bus)
                        .seatNumber(seatNumber)
                        .seatType(seatType)
                        .status(Seat.SeatStatus.AVAILABLE)
                        .build());
                seatCount++;
            }
            if (seatCount >= totalSeats) break;
        }
        seatRepository.saveAll(seats);
        log.info("Initialized {} seats for bus {}", seats.size(), busId);
    }

    private SeatResponse mapToSeatResponse(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .seatNumber(seat.getSeatNumber())
                .seatType(seat.getSeatType().name())
                .status(seat.getStatus().name())
                .locked(seat.getStatus() == Seat.SeatStatus.LOCKED)
                .build();
    }
}
