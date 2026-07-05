package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.Accommodation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AccommodationRepository extends JpaRepository<Accommodation, UUID> {

    @Query("SELECT a FROM Accommodation a WHERE a.operationalStatus = 'AVAILABLE' " +
            "AND a.status = 'AVAILABLE' " + // Optional: depend on how status is managed
            "AND a.id NOT IN (" +
            "   SELECT b.accommodation.id FROM Booking b " +
            "   WHERE b.status != 'CANCELLED' " +
            "   AND b.checkinDate < :checkoutDate " +
            "   AND b.checkoutDate > :checkinDate" +
            ")")
    List<Accommodation> findAvailableAccommodations(
            @Param("checkinDate") LocalDate checkinDate,
            @Param("checkoutDate") LocalDate checkoutDate
    );
}
