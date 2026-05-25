package com.busbooking.repository;

import com.busbooking.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByBusIdOrderBySeatNumber(Long busId);

    long countByBusId(Long busId);

    Optional<Seat> findByBusIdAndSeatNumber(Long busId, String seatNumber);

    List<Seat> findByBusIdAndStatus(Long busId, Seat.SeatStatus status);

    @Query("SELECT s FROM Seat s WHERE s.bus.id = :busId AND s.seatNumber IN :seatNumbers")
    List<Seat> findByBusIdAndSeatNumbers(@Param("busId") Long busId,
                                         @Param("seatNumbers") List<String> seatNumbers);

    @Modifying
    @Query("UPDATE Seat s SET s.status = 'AVAILABLE', s.lockedAt = null, s.lockedByUserId = null " +
           "WHERE s.lockedAt IS NOT NULL AND s.lockedAt < :expiredBefore AND s.status = 'LOCKED'")
    int releaseExpiredLocks(@Param("expiredBefore") LocalDateTime expiredBefore);

    @Query("SELECT s FROM Seat s WHERE s.bus.id = :busId AND s.lockedAt IS NOT NULL " +
           "AND s.lockedAt > :activeAfter AND s.status = 'LOCKED'")
    List<Seat> findActiveLockedSeats(@Param("busId") Long busId,
                                     @Param("activeAfter") LocalDateTime activeAfter);
}
