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
    boolean existsByCode(String code);

    @Query(value = "SELECT * FROM accommodations a " +
            "WHERE a.operational_status = 'VACANT' AND a.status = 'ACTIVE' " +
            "AND a.id NOT IN ( " +
            "   SELECT b.accommodation_id FROM bookings b " +
            "   WHERE b.status != 'CANCELLED' " +
            "   AND b.checkin_date < :checkoutDate " +
            "   AND b.checkout_date > :checkinDate " +
            ") " +
            "AND a.id NOT IN ( " +
            "   SELECT rh.accommodation_id FROM room_holds rh " +
            "   WHERE rh.expires_at > CURRENT_TIMESTAMP " +
            "   AND rh.checkin_date < :checkoutDate " +
            "   AND rh.checkout_date > :checkinDate " +
            ")", nativeQuery = true)
    List<Accommodation> findAvailableAccommodations(
            @Param("checkinDate") java.time.LocalDateTime checkinDate,
            @Param("checkoutDate") java.time.LocalDateTime checkoutDate
    );

    @Query(value = "SELECT * FROM accommodations a " +
            "WHERE a.category_id = :categoryId " +
            "AND a.operational_status = 'VACANT' AND a.status = 'ACTIVE' " +
            "AND a.id NOT IN ( " +
            "   SELECT b.accommodation_id FROM bookings b " +
            "   WHERE b.status != 'CANCELLED' " +
            "   AND b.checkin_date < :checkoutDate " +
            "   AND b.checkout_date > :checkinDate " +
            ") " +
            "AND a.id NOT IN ( " +
            "   SELECT rh.accommodation_id FROM room_holds rh " +
            "   WHERE rh.expires_at > CURRENT_TIMESTAMP " +
            "   AND rh.checkin_date < :checkoutDate " +
            "   AND rh.checkout_date > :checkinDate " +
            ") LIMIT 1 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    Accommodation findAvailableAccommodationWithLock(
            @Param("categoryId") UUID categoryId,
            @Param("checkinDate") java.time.LocalDateTime checkinDate,
            @Param("checkoutDate") java.time.LocalDateTime checkoutDate
    );
}
