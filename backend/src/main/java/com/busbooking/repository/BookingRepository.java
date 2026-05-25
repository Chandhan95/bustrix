package com.busbooking.repository;

import com.busbooking.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Optional<Booking> findByPnrNumber(String pnrNumber);

    @EntityGraph(attributePaths = {"schedule", "schedule.bus", "schedule.route"})
    Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @EntityGraph(attributePaths = {"schedule", "schedule.bus", "schedule.route"})
    List<Booking> findByScheduleId(Long scheduleId);

    @EntityGraph(attributePaths = {"schedule", "schedule.bus", "schedule.route"})
    @Query("SELECT b FROM Booking b WHERE b.schedule.id = :scheduleId " +
           "AND b.status NOT IN ('CANCELLED', 'FAILED')")
    List<Booking> findActiveBookingsByScheduleId(@Param("scheduleId") Long scheduleId);

    @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE b.status = 'CONFIRMED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND MONTH(b.createdAt) = MONTH(CURRENT_DATE) " +
           "AND YEAR(b.createdAt) = YEAR(CURRENT_DATE)")
    BigDecimal getMonthlyRevenue();

    @Query("SELECT SUM(b.finalAmount) FROM Booking b WHERE b.status = 'CONFIRMED' " +
           "AND DATE(b.createdAt) = CURRENT_DATE")
    BigDecimal getTodayRevenue();

    @Query("SELECT COUNT(b) FROM Booking b WHERE DATE(b.createdAt) = CURRENT_DATE")
    Long getTodayBookings();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CONFIRMED'")
    Long countConfirmedBookings();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = 'CANCELLED'")
    Long countCancelledBookings();

    @Query(value = "SELECT MONTHNAME(b.created_at) as month, COUNT(*) as count " +
                   "FROM bookings b WHERE YEAR(b.created_at) = YEAR(CURDATE()) " +
                   "GROUP BY MONTH(b.created_at), MONTHNAME(b.created_at) " +
                   "ORDER BY MONTH(b.created_at)", nativeQuery = true)
    List<Object[]> getBookingsByMonth();

    @Query(value = "SELECT r.source, r.destination, COUNT(b.id) as bookingCount " +
                   "FROM bookings b " +
                   "JOIN schedules s ON b.schedule_id = s.id " +
                   "JOIN routes r ON s.route_id = r.id " +
                   "WHERE b.status = 'CONFIRMED' " +
                   "GROUP BY r.source, r.destination " +
                   "ORDER BY bookingCount DESC LIMIT 5", nativeQuery = true)
    List<Object[]> getTopRoutes();
}
