package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.AccommodationCategory;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccommodationCategoryRepository extends JpaRepository<AccommodationCategory, UUID> {
    boolean existsByCode(String code);

    @Override
    @EntityGraph(attributePaths = {"images", "amenities"})
    List<AccommodationCategory> findAll();

    @EntityGraph(attributePaths = {"images", "amenities"})
    @Query("SELECT c FROM AccommodationCategory c WHERE c.id = :id")
    Optional<AccommodationCategory> findByIdWithDetails(@Param("id") UUID id);
}
