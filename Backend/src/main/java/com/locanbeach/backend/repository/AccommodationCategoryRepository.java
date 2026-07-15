package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.AccommodationCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AccommodationCategoryRepository extends JpaRepository<AccommodationCategory, UUID> {
    boolean existsByCode(String code);
}
