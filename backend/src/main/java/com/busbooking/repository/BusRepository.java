package com.busbooking.repository;

import com.busbooking.entity.Bus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, Long> {

    Optional<Bus> findByBusNumber(String busNumber);

    boolean existsByBusNumber(String busNumber);

    Page<Bus> findByActiveTrue(Pageable pageable);

    @Query("SELECT b FROM Bus b WHERE b.active = true AND " +
           "(LOWER(b.busName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(b.busNumber) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Bus> searchBuses(@Param("query") String query, Pageable pageable);

    Long countByActiveTrue();
}
