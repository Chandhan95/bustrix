package com.busbooking.config;

import com.busbooking.entity.*;
import com.busbooking.repository.*;
import com.busbooking.service.SeatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final ScheduleRepository scheduleRepository;
    private final SeatRepository seatRepository;
    private final PasswordEncoder passwordEncoder;
    private final SeatService seatService;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("=== BusTix Database Seeder Starting ===");
        seedUsers();
        seedBuses();
        seedRoutes();
        seedSchedules();
        log.info("=== BusTix Database Seeder Complete ===");
    }

    // ─── USERS ─────────────────────────────────────────────────────────────────

    private void seedUsers() {
        // Always ensure admin exists with the correct password and enabled
        userRepository.findByEmail("admin@bustix.com").ifPresentOrElse(admin -> {
            admin.setPassword(passwordEncoder.encode("Admin@123456"));
            admin.setEnabled(true);
            admin.setAccountNonLocked(true);
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            log.info("✅ Admin user re-seeded: admin@bustix.com / Admin@123456");
        }, () -> {
            User admin = User.builder()
                    .firstName("Admin")
                    .lastName("BusTix")
                    .email("admin@bustix.com")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .phone("9999999999")
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .accountNonLocked(true)
                    .build();
            userRepository.save(admin);
            log.info("✅ Admin user created: admin@bustix.com / Admin@123456");
        });

        // Demo customer user
        if (!userRepository.existsByEmail("user@bustix.com")) {
            User user = User.builder()
                    .firstName("Demo")
                    .lastName("User")
                    .email("user@bustix.com")
                    .password(passwordEncoder.encode("User@123456"))
                    .phone("8888888888")
                    .role(User.Role.USER)
                    .enabled(true)
                    .accountNonLocked(true)
                    .build();
            userRepository.save(user);
            log.info("✅ Demo user created: user@bustix.com / User@123456");
        }
    }

    // ─── BUSES ─────────────────────────────────────────────────────────────────

    private void seedBuses() {
        seedBus("Rajdhani Express", "TN-01-AB-1234", Bus.BusType.AC_SEATER, 40, "AC,WiFi,USB,Water", "Express Travels", "9876543210");
        seedBus("Night Rider", "MH-02-CD-5678", Bus.BusType.SLEEPER, 36, "AC,WiFi,Blanket,Water", "Night Travels", "9876543211");
        seedBus("City Connect", "KA-03-EF-9012", Bus.BusType.SEATER, 45, "Fan,Water", "City Bus Co.", "9876543212");
        seedBus("Volvo Premier", "DL-04-GH-3456", Bus.BusType.VOLVO, 41, "AC,WiFi,USB,TV,Snacks", "Premier Travels", "9876543213");
        seedBus("Golden Chariot", "GJ-05-IJ-7890", Bus.BusType.LUXURY, 32, "AC,WiFi,USB,TV,Meal,Blanket", "Royal Travels", "9876543214");
        seedBus("KPN Travels", "TN-06-KL-1122", Bus.BusType.AC_SLEEPER, 40, "AC,Blanket,Water,Charging", "KPN Travels", "9876543215");
        seedBus("SRS Travels", "KA-07-MN-3344", Bus.BusType.SEMI_SLEEPER, 42, "AC,WiFi,Water", "SRS Travels", "9876543216");
        seedBus("Orange Tours", "MH-08-OP-5566", Bus.BusType.VOLVO, 41, "AC,WiFi,TV,USB,Snacks", "Orange Tours", "9876543217");
    }

    private void seedBus(String name, String number, Bus.BusType type, int seats,
                         String amenities, String operator, String contact) {
        if (!busRepository.existsByBusNumber(number)) {
            Bus bus = Bus.builder()
                    .busName(name)
                    .busNumber(number)
                    .busType(type)
                    .totalSeats(seats)
                    .availableSeats(seats)
                    .amenities(amenities)
                    .operatorName(operator)
                    .contactNumber(contact)
                    .active(true)
                    .build();
            Bus saved = busRepository.save(bus);
            if (seatRepository.countByBusId(saved.getId()) == 0) {
                seatService.initializeSeatsForBus(saved.getId(), seats);
            }
            log.info("✅ Bus seeded: {} ({})", name, number);
        } else {
            // Ensure existing bus has seats initialized
            busRepository.findByBusNumber(number).ifPresent(bus -> {
                if (seatRepository.countByBusId(bus.getId()) == 0) {
                    seatService.initializeSeatsForBus(bus.getId(), bus.getTotalSeats());
                    log.info("✅ Seats initialized for existing bus: {}", number);
                }
            });
        }
    }

    // ─── ROUTES ────────────────────────────────────────────────────────────────

    private void seedRoutes() {
        seedRoute("Mumbai", "Pune", 148.0, 180, "Maharashtra", "Maharashtra");
        seedRoute("Delhi", "Jaipur", 281.0, 300, "Delhi", "Rajasthan");
        seedRoute("Bangalore", "Chennai", 347.0, 360, "Karnataka", "Tamil Nadu");
        seedRoute("Hyderabad", "Bangalore", 570.0, 480, "Telangana", "Karnataka");
        seedRoute("Mumbai", "Ahmedabad", 524.0, 420, "Maharashtra", "Gujarat");
        seedRoute("Delhi", "Agra", 233.0, 240, "Delhi", "Uttar Pradesh");
        seedRoute("Chennai", "Coimbatore", 502.0, 420, "Tamil Nadu", "Tamil Nadu");
        seedRoute("Bangalore", "Hyderabad", 570.0, 480, "Karnataka", "Telangana");
        seedRoute("Chennai", "Bangalore", 347.0, 360, "Tamil Nadu", "Karnataka");
        seedRoute("Kolkata", "Bhubaneswar", 480.0, 420, "West Bengal", "Odisha");
        seedRoute("Pune", "Goa", 450.0, 360, "Maharashtra", "Goa");
        seedRoute("Hyderabad", "Chennai", 630.0, 540, "Telangana", "Tamil Nadu");
        seedRoute("Mumbai", "Nagpur", 838.0, 720, "Maharashtra", "Maharashtra");
        seedRoute("Delhi", "Chandigarh", 248.0, 240, "Delhi", "Punjab");
        seedRoute("Bangalore", "Mysore", 150.0, 180, "Karnataka", "Karnataka");
    }

    private void seedRoute(String source, String dest, double dist, int duration,
                           String srcState, String dstState) {
        if (!routeRepository.existsBySourceIgnoreCaseAndDestinationIgnoreCase(source, dest)) {
            Route route = Route.builder()
                    .source(source)
                    .destination(dest)
                    .distanceKm(dist)
                    .estimatedDurationMinutes(duration)
                    .sourceState(srcState)
                    .destinationState(dstState)
                    .active(true)
                    .build();
            routeRepository.save(route);
            log.info("✅ Route seeded: {} → {}", source, dest);
        }
    }

    // ─── SCHEDULES ─────────────────────────────────────────────────────────────

    private void seedSchedules() {
        List<Bus> buses = busRepository.findAll().stream()
                .filter(Bus::isActive).toList();
        List<Route> routes = routeRepository.findByActiveTrueOrderBySourceAsc();

        if (buses.isEmpty() || routes.isEmpty()) {
            log.warn("⚠️ No buses or routes found for schedule seeding");
            return;
        }

        LocalDate today = LocalDate.now();

        // Create schedules for today + next 7 days
        for (int dayOffset = 0; dayOffset <= 7; dayOffset++) {
            LocalDate date = today.plusDays(dayOffset);
            seedScheduleIfAbsent(buses, routes, 0, "Bangalore", "Chennai", date, LocalTime.of(6, 0), LocalTime.of(12, 0), 649);
            seedScheduleIfAbsent(buses, routes, 1, "Hyderabad", "Bangalore", date, LocalTime.of(20, 0), LocalTime.of(4, 0), 849);
            seedScheduleIfAbsent(buses, routes, 2, "Bangalore", "Mysore", date, LocalTime.of(7, 0), LocalTime.of(10, 0), 199);
            seedScheduleIfAbsent(buses, routes, 3, "Delhi", "Jaipur", date, LocalTime.of(6, 0), LocalTime.of(11, 0), 799);
            seedScheduleIfAbsent(buses, routes, 0, "Mumbai", "Pune", date, LocalTime.of(8, 0), LocalTime.of(11, 0), 299);
            seedScheduleIfAbsent(buses, routes, 4, "Mumbai", "Ahmedabad", date, LocalTime.of(10, 0), LocalTime.of(17, 0), 1199);
            seedScheduleIfAbsent(buses, routes, 5, "Chennai", "Coimbatore", date, LocalTime.of(22, 0), LocalTime.of(6, 0), 749);
            seedScheduleIfAbsent(buses, routes, 6, "Chennai", "Bangalore", date, LocalTime.of(9, 0), LocalTime.of(15, 0), 649);
            seedScheduleIfAbsent(buses, routes, 7, "Hyderabad", "Bangalore", date, LocalTime.of(19, 30), LocalTime.of(3, 30), 899);
            seedScheduleIfAbsent(buses, routes, 3, "Delhi", "Agra", date, LocalTime.of(7, 0), LocalTime.of(11, 0), 699);
            seedScheduleIfAbsent(buses, routes, 1, "Bangalore", "Hyderabad", date, LocalTime.of(21, 0), LocalTime.of(5, 0), 899);
            seedScheduleIfAbsent(buses, routes, 0, "Hyderabad", "Chennai", date, LocalTime.of(17, 0), LocalTime.of(23, 0), 999);
        }
        log.info("✅ Schedules seeded for next 8 days");
    }

    private void seedScheduleIfAbsent(List<Bus> buses, List<Route> routes,
                                       int busIndex, String source, String dest,
                                       LocalDate date, LocalTime dep, LocalTime arr, int price) {
        if (busIndex >= buses.size()) return;
        Bus bus = buses.get(busIndex);

        Route route = routes.stream()
                .filter(r -> r.getSource().equalsIgnoreCase(source) && r.getDestination().equalsIgnoreCase(dest))
                .findFirst().orElse(null);
        if (route == null) return;

        final Long routeId = route.getId();
        boolean exists = scheduleRepository.findByBusId(bus.getId()).stream()
                .anyMatch(s -> s.getTravelDate().equals(date) && s.getRoute().getId().equals(routeId));
        if (!exists) {
            Schedule schedule = Schedule.builder()
                    .bus(bus)
                    .route(route)
                    .travelDate(date)
                    .departureTime(dep)
                    .arrivalTime(arr)
                    .pricePerSeat(BigDecimal.valueOf(price))
                    .availableSeats(bus.getTotalSeats())
                    .status(Schedule.ScheduleStatus.SCHEDULED)
                    .build();
            scheduleRepository.save(schedule);
        }
    }
}
