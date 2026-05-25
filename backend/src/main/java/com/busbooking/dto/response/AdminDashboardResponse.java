package com.busbooking.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private Long totalUsers;
    private Long totalBuses;
    private Long totalRoutes;
    private Long totalBookings;
    private Long confirmedBookings;
    private Long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private Map<String, Long> bookingsByMonth;
    private Map<String, BigDecimal> revenueByMonth;
    private Map<String, Long> topRoutes;
    private Long todayBookings;
    private BigDecimal todayRevenue;
}
