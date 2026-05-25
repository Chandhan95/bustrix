package com.busbooking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class BusRequest {

    @NotBlank(message = "Bus name is required")
    private String busName;

    @NotBlank(message = "Bus number is required")
    private String busNumber;

    @NotNull(message = "Bus type is required")
    private String busType;

    @NotNull(message = "Total seats is required")
    @Min(value = 10, message = "Minimum 10 seats required")
    @Max(value = 60, message = "Maximum 60 seats allowed")
    private Integer totalSeats;

    private String amenities;
    private String operatorName;
    private String contactNumber;
}
