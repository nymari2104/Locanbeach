package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.RoomHold;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface RoomHoldRepository extends JpaRepository<RoomHold, UUID> {

    @Modifying
    @Query(value = "DELETE FROM room_holds WHERE expires_at <= :now", nativeQuery = true)
    void deleteExpiredHolds(@Param("now") LocalDateTime now);
}
