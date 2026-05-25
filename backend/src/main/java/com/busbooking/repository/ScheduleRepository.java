package com.busbooking.repository;

import com.busbooking.entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    @EntityGraph(attributePaths = {"bus", "route"})
    @Query("SELECT s FROM Schedule s " +
           "JOIN s.bus b " +
           "JOIN s.route r " +
           "WHERE LOWER(r.source) = LOWER(:source) " +
           "AND LOWER(r.destination) = LOWER(:destination) " +
           "AND s.travelDate = :travelDate " +
           "AND (s.travelDate > CURRENT_DATE OR (s.travelDate = CURRENT_DATE AND s.departureTime > CURRENT_TIME)) " +
           "AND s.availableSeats >= :seats " +
           "AND s.status = 'SCHEDULED' " +
           "AND b.active = true " +
           "AND r.active = true " +
           "ORDER BY s.departureTime ASC")
    List<Schedule> findAvailableSchedules(@Param("source") String source,
                                          @Param("destination") String destination,
                                          @Param("travelDate") LocalDate travelDate,
                                          @Param("seats") int seats);

    @EntityGraph(attributePaths = {"bus", "route"})
    @Query("SELECT s FROM Schedule s WHERE s.bus.id = :busId ORDER BY s.travelDate DESC")
    List<Schedule> findByBusId(@Param("busId") Long busId);

    @Query("SELECT COUNT(s) FROM Schedule s WHERE s.status = 'SCHEDULED' AND s.travelDate >= CURRENT_DATE")
    Long countUpcomingSchedules();

    @EntityGraph(attributePaths = {"bus", "route"})
    Page<Schedule> findAllByOrderByTravelDateDesc(Pageable pageable);
}
