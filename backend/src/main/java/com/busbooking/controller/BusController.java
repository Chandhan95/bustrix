package com.busbooking.controller;

import com.busbooking.dto.request.BusSearchRequest;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.ScheduleResponse;
import com.busbooking.dto.response.SeatResponse;
import com.busbooking.repository.RouteRepository;
import com.busbooking.service.BusService;
import com.busbooking.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class BusController {

    private final BusService busService;
    private final SeatService seatService;
    private final RouteRepository routeRepository;

    @PostMapping("/buses/search")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> searchBuses(
            @Valid @RequestBody BusSearchRequest request) {
        log.info("Searching buses: {} → {} on {}", request.getSource(),
                request.getDestination(), request.getTravelDate());
        List<ScheduleResponse> schedules = busService.searchBuses(request);
        return ResponseEntity.ok(ApiResponse.success(
                schedules.isEmpty() ? "No buses found for this route and date" : "Buses found",
                schedules));
    }

    @GetMapping("/buses/{busId}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getBusSeats(
            @PathVariable Long busId) {
        List<SeatResponse> seats = seatService.getSeatsByBus(busId);
        return ResponseEntity.ok(ApiResponse.success("Seats fetched successfully", seats));
    }

    @GetMapping("/schedules/{scheduleId}/seats")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getScheduleSeats(
            @PathVariable Long scheduleId) {
        List<SeatResponse> seats = seatService.getSeatsForSchedule(scheduleId);
        return ResponseEntity.ok(ApiResponse.success("Seats fetched successfully for schedule", seats));
    }

    @GetMapping("/routes/cities")
    public ResponseEntity<ApiResponse<Object>> getCities() {
        List<String> sources = routeRepository.findAllSources();
        List<String> destinations = routeRepository.findAllDestinations();
        return ResponseEntity.ok(ApiResponse.success("Cities fetched", 
                java.util.Map.of("sources", sources, "destinations", destinations)));
    }
}
