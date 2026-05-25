package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleResponse {
    private Long scheduleId;
    private Long busId;
    private String busName;
    private String busNumber;
    private String busType;
    private String amenities;
    private Long routeId;
    private String source;
    private String destination;
    private Double distanceKm;
    private LocalDate travelDate;
    private LocalTime departureTime;
    private LocalTime arrivalTime;
    private Integer durationMinutes;
    private BigDecimal pricePerSeat;
    private Integer availableSeats;
    private Integer totalSeats;
    private String status;
    private String operatorName;
}
