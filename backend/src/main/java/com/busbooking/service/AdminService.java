package com.busbooking.service;

import com.busbooking.dto.request.RouteRequest;
import com.busbooking.dto.request.ScheduleRequest;
import com.busbooking.dto.response.AdminDashboardResponse;
import com.busbooking.dto.response.UserResponse;
import com.busbooking.entity.*;
import com.busbooking.exception.DuplicateResourceException;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminService {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final BookingRepository bookingRepository;

    // ===================== DASHBOARD =====================

    public AdminDashboardResponse getDashboardStats() {
        log.info("Fetching admin dashboard stats");

        Long totalUsers = userRepository.countByRole(User.Role.USER);
        Long totalBuses = busRepository.countByActiveTrue();
        Long totalRoutes = routeRepository.countByActiveTrue();
        Long totalBookings = bookingRepository.count();
        Long confirmedBookings = bookingRepository.countConfirmedBookings();
        Long cancelledBookings = bookingRepository.countCancelledBookings();

        BigDecimal totalRevenue = Optional.ofNullable(bookingRepository.getTotalRevenue())
                .orElse(BigDecimal.ZERO);
        BigDecimal monthlyRevenue = Optional.ofNullable(bookingRepository.getMonthlyRevenue())
                .orElse(BigDecimal.ZERO);
        BigDecimal todayRevenue = Optional.ofNullable(bookingRepository.getTodayRevenue())
                .orElse(BigDecimal.ZERO);
        Long todayBookings = Optional.ofNullable(bookingRepository.getTodayBookings())
                .orElse(0L);

        // Bookings by month
        Map<String, Long> bookingsByMonth = new LinkedHashMap<>();
        List<Object[]> monthlyData = bookingRepository.getBookingsByMonth();
        for (Object[] row : monthlyData) {
            bookingsByMonth.put((String) row[0], ((Number) row[1]).longValue());
        }

        // Top routes
        Map<String, Long> topRoutes = new LinkedHashMap<>();
        List<Object[]> routeData = bookingRepository.getTopRoutes();
        for (Object[] row : routeData) {
            String route = row[0] + " → " + row[1];
            topRoutes.put(route, ((Number) row[2]).longValue());
        }

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .totalBuses(totalBuses)
                .totalRoutes(totalRoutes)
                .totalBookings(totalBookings)
                .confirmedBookings(confirmedBookings)
                .cancelledBookings(cancelledBookings)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .todayRevenue(todayRevenue)
                .todayBookings(todayBookings)
                .bookingsByMonth(bookingsByMonth)
                .topRoutes(topRoutes)
                .build();
    }

    // ===================== USERS =====================

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(this::mapToUserResponse);
    }

    public Page<UserResponse> searchUsers(String query, Pageable pageable) {
        return userRepository.searchUsers(query, pageable).map(this::mapToUserResponse);
    }

    public void toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
        log.info("User {} status toggled to: {}", user.getEmail(), user.isEnabled());
    }

    public void updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        userRepository.save(user);
        log.info("User {} role updated to: {}", user.getEmail(), role);
    }

    // ===================== ROUTES =====================

    public Route createRoute(RouteRequest request) {
        if (routeRepository.existsBySourceIgnoreCaseAndDestinationIgnoreCase(
                request.getSource(), request.getDestination())) {
            throw new DuplicateResourceException(
                    "Route already exists: " + request.getSource() + " → " + request.getDestination());
        }

        Route route = Route.builder()
                .source(request.getSource())
                .destination(request.getDestination())
                .distanceKm(request.getDistanceKm())
                .estimatedDurationMinutes(request.getEstimatedDurationMinutes())
                .sourceState(request.getSourceState())
                .destinationState(request.getDestinationState())
                .active(true)
                .build();

        return routeRepository.save(route);
    }

    public Route updateRoute(Long id, RouteRequest request) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", "id", id));
        route.setDistanceKm(request.getDistanceKm());
        route.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        route.setSourceState(request.getSourceState());
        route.setDestinationState(request.getDestinationState());
        return routeRepository.save(route);
    }

    public void deleteRoute(Long id) {
        Route route = routeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Route", "id", id));
        route.setActive(false);
        routeRepository.save(route);
    }

    public List<Route> getAllRoutes() {
        return routeRepository.findByActiveTrueOrderBySourceAsc();
    }

    // ===================== SCHEDULES =====================

    public Schedule createSchedule(ScheduleRequest request) {
        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", request.getBusId()));
        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route", "id", request.getRouteId()));

        Schedule schedule = Schedule.builder()
                .bus(bus)
                .route(route)
                .travelDate(request.getTravelDate())
                .departureTime(request.getDepartureTime())
                .arrivalTime(request.getArrivalTime())
                .pricePerSeat(request.getPricePerSeat())
                .availableSeats(bus.getTotalSeats())
                .status(Schedule.ScheduleStatus.SCHEDULED)
                .build();

        return scheduleRepository.save(schedule);
    }

    public Page<Schedule> getAllSchedules(Pageable pageable) {
        return scheduleRepository.findAllByOrderByTravelDateDesc(pageable);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
