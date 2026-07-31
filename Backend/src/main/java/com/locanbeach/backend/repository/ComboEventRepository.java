package com.locanbeach.backend.repository;

import com.locanbeach.backend.entity.ComboEvent;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ComboEventRepository extends JpaRepository<ComboEvent, UUID> {

    @Override
    @EntityGraph(attributePaths = {"images"})
    List<ComboEvent> findAll();

    @EntityGraph(attributePaths = {"images"})
    @Query("SELECT c FROM ComboEvent c WHERE c.id = :id")
    Optional<ComboEvent> findByIdWithDetails(@Param("id") UUID id);
}
