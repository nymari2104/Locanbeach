package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.Service;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ServiceRepository extends JpaRepository<Service, UUID> {
    boolean existsByName(String name);

    @Override
    @EntityGraph(attributePaths = {"images"})
    List<Service> findAll();

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT s FROM Service s WHERE s.id = :id")
    Optional<Service> findByIdWithDetails(@Param("id") UUID id);
}
