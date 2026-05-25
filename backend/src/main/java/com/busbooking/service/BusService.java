package com.busbooking.service;

import com.busbooking.dto.request.BusRequest;
import com.busbooking.dto.request.BusSearchRequest;
import com.busbooking.dto.response.ScheduleResponse;
import com.busbooking.entity.Bus;
import com.busbooking.entity.Schedule;
import com.busbooking.exception.DuplicateResourceException;
import com.busbooking.exception.ResourceNotFoundException;
import com.busbooking.repository.BusRepository;
import com.busbooking.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BusService {

    private final BusRepository busRepository;
    private final ScheduleRepository scheduleRepository;

    public List<ScheduleResponse> searchBuses(BusSearchRequest request) {
        log.info("Searching buses from {} to {} on {}", request.getSource(),
                request.getDestination(), request.getTravelDate());

        List<Schedule> schedules = scheduleRepository.findAvailableSchedules(
                request.getSource(), request.getDestination(),
                request.getTravelDate(), request.getSeats()
        );

        log.info("Found {} available buses", schedules.size());
        return schedules.stream().map(this::mapToScheduleResponse).collect(Collectors.toList());
    }

    public Bus createBus(BusRequest request) {
        if (busRepository.existsByBusNumber(request.getBusNumber())) {
            throw new DuplicateResourceException("Bus with number " + request.getBusNumber() + " already exists");
        }

        Bus bus = Bus.builder()
                .busName(request.getBusName())
                .busNumber(request.getBusNumber())
                .busType(Bus.BusType.valueOf(request.getBusType()))
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .amenities(request.getAmenities())
                .operatorName(request.getOperatorName())
                .contactNumber(request.getContactNumber())
                .active(true)
                .build();

        Bus savedBus = busRepository.save(bus);
        log.info("Bus created: {} ({})", savedBus.getBusName(), savedBus.getBusNumber());
        return savedBus;
    }

    public Bus updateBus(Long id, BusRequest request) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", id));

        bus.setBusName(request.getBusName());
        bus.setBusType(Bus.BusType.valueOf(request.getBusType()));
        bus.setAmenities(request.getAmenities());
        bus.setOperatorName(request.getOperatorName());
        bus.setContactNumber(request.getContactNumber());

        return busRepository.save(bus);
    }

    public void deleteBus(Long id) {
        Bus bus = busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", id));
        bus.setActive(false);
        busRepository.save(bus);
        log.info("Bus deactivated: {}", bus.getBusNumber());
    }

    public Bus getBusById(Long id) {
        return busRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bus", "id", id));
    }

    public Page<Bus> getAllBuses(Pageable pageable) {
        return busRepository.findByActiveTrue(pageable);
    }

    public Page<Bus> searchBusesByQuery(String query, Pageable pageable) {
        return busRepository.searchBuses(query, pageable);
    }

    private ScheduleResponse mapToScheduleResponse(Schedule schedule) {
        Bus bus = schedule.getBus();
        return ScheduleResponse.builder()
                .scheduleId(schedule.getId())
                .busId(bus.getId())
                .busName(bus.getBusName())
                .busNumber(bus.getBusNumber())
                .busType(bus.getBusType().name())
                .amenities(bus.getAmenities())
                .routeId(schedule.getRoute().getId())
                .source(schedule.getRoute().getSource())
                .destination(schedule.getRoute().getDestination())
                .distanceKm(schedule.getRoute().getDistanceKm())
                .travelDate(schedule.getTravelDate())
                .departureTime(schedule.getDepartureTime())
                .arrivalTime(schedule.getArrivalTime())
                .durationMinutes(schedule.getRoute().getEstimatedDurationMinutes())
                .pricePerSeat(schedule.getPricePerSeat())
                .availableSeats(schedule.getAvailableSeats())
                .totalSeats(bus.getTotalSeats())
                .status(schedule.getStatus().name())
                .operatorName(bus.getOperatorName())
                .build();
    }
}
