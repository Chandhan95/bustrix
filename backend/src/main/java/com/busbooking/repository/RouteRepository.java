package com.busbooking.repository;

import com.busbooking.entity.Route;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {

    Optional<Route> findBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    boolean existsBySourceIgnoreCaseAndDestinationIgnoreCase(String source, String destination);

    List<Route> findByActiveTrueOrderBySourceAsc();

    @Query("SELECT DISTINCT r.source FROM Route r WHERE r.active = true ORDER BY r.source ASC")
    List<String> findAllSources();

    @Query("SELECT DISTINCT r.destination FROM Route r WHERE r.active = true ORDER BY r.destination ASC")
    List<String> findAllDestinations();

    Long countByActiveTrue();
}
