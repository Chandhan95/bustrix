package com.busbooking.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"bus_id", "seatNumber"})
})
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(nullable = false, length = 10)
    private String seatNumber; // e.g., A1, A2, B1

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatType seatType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SeatStatus status = SeatStatus.AVAILABLE;

    // Locking mechanism
    private LocalDateTime lockedAt;
    private Long lockedByUserId;
    private Long lockedScheduleId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public boolean isLocked(Long scheduleId) {
        if (lockedAt == null || lockedScheduleId == null || !lockedScheduleId.equals(scheduleId)) return false;
        return LocalDateTime.now().isBefore(lockedAt.plusMinutes(10));
    }

    public enum SeatType {
        WINDOW, AISLE, MIDDLE, LOWER_BERTH, UPPER_BERTH
    }

    public enum SeatStatus {
        AVAILABLE, BOOKED, LOCKED, MAINTENANCE
    }
}
