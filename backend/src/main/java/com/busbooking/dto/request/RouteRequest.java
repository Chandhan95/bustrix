package com.busbooking.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RouteRequest {

    @NotBlank(message = "Source is required")
    private String source;

    @NotBlank(message = "Destination is required")
    private String destination;

    @NotNull(message = "Distance is required")
    @Positive(message = "Distance must be positive")
    private Double distanceKm;

    @NotNull(message = "Estimated duration is required")
    @Positive(message = "Duration must be positive")
    private Integer estimatedDurationMinutes;

    private String sourceState;
    private String destinationState;
}
