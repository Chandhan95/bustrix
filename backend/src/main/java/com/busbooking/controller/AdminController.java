package com.busbooking.controller;

import com.busbooking.dto.request.BusRequest;
import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.request.ScheduleRequest;
import com.busbooking.dto.response.AdminDashboardResponse;
import com.busbooking.dto.response.ApiResponse;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.entity.Bus;
import com.busbooking.entity.Route;
import com.busbooking.entity.Schedule;
import com.busbooking.service.AdminService;
import com.busbooking.service.BusService;
import com.busbooking.service.SeatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final AdminService adminService;
    private final BusService busService;
    private final SeatService seatService;

    // ======= DASHBOARD =======

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard data fetched", stats));
    }

    // ======= USER MANAGEMENT =======

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String query) {
        Pageable pageable = PageRequest.of(page, size);
        Page<UserResponse> users = (query != null && !query.isBlank())
                ? adminService.searchUsers(query, pageable)
                : adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.success("Users fetched", users));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(@PathVariable Long userId) {
        adminService.toggleUserStatus(userId);
        return ResponseEntity.ok(ApiResponse.success("User status updated", null));
    }

    @PatchMapping("/users/{userId}/role")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable Long userId, @RequestBody Map<String, String> body) {
        adminService.updateUserRole(userId, body.get("role"));
        return ResponseEntity.ok(ApiResponse.success("User role updated", null));
    }

    // ======= BUS MANAGEMENT =======

    @PostMapping("/buses")
    public ResponseEntity<ApiResponse<Bus>> createBus(@Valid @RequestBody BusRequest request) {
        Bus bus = busService.createBus(request);
        // Initialize seats
        seatService.initializeSeatsForBus(bus.getId(), bus.getTotalSeats());
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Bus created successfully", bus));
    }

    @PutMapping("/buses/{id}")
    public ResponseEntity<ApiResponse<Bus>> updateBus(
            @PathVariable Long id, @Valid @RequestBody BusRequest request) {
        Bus bus = busService.updateBus(id, request);
        return ResponseEntity.ok(ApiResponse.success("Bus updated successfully", bus));
    }

    @DeleteMapping("/buses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBus(@PathVariable Long id) {
        busService.deleteBus(id);
        return ResponseEntity.ok(ApiResponse.success("Bus deactivated successfully", null));
    }

    @GetMapping("/buses")
    public ResponseEntity<ApiResponse<Page<Bus>>> getAllBuses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Buses fetched",
                busService.getAllBuses(pageable)));
    }

    // ======= ROUTE MANAGEMENT =======

    @PostMapping("/routes")
    public ResponseEntity<ApiResponse<Route>> createRoute(@Valid @RequestBody RouteRequest request) {
        Route route = adminService.createRoute(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Route created successfully", route));
    }

    @PutMapping("/routes/{id}")
    public ResponseEntity<ApiResponse<Route>> updateRoute(
            @PathVariable Long id, @Valid @RequestBody RouteRequest request) {
        Route route = adminService.updateRoute(id, request);
        return ResponseEntity.ok(ApiResponse.success("Route updated successfully", route));
    }

    @DeleteMapping("/routes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable Long id) {
        adminService.deleteRoute(id);
        return ResponseEntity.ok(ApiResponse.success("Route deactivated successfully", null));
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<Route>>> getAllRoutes() {
        return ResponseEntity.ok(ApiResponse.success("Routes fetched", adminService.getAllRoutes()));
    }

    // ======= SCHEDULE MANAGEMENT =======

    @PostMapping("/schedules")
    public ResponseEntity<ApiResponse<Schedule>> createSchedule(
            @Valid @RequestBody ScheduleRequest request) {
        Schedule schedule = adminService.createSchedule(request);
        return ResponseEntity.status(201)
                .body(ApiResponse.created("Schedule created successfully", schedule));
    }

    @GetMapping("/schedules")
    public ResponseEntity<ApiResponse<Page<Schedule>>> getAllSchedules(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(ApiResponse.success("Schedules fetched",
                adminService.getAllSchedules(pageable)));
    }
}
