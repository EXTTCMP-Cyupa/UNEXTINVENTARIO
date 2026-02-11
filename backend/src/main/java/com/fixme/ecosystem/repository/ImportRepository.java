package com.fixme.ecosystem.repository;

import com.fixme.ecosystem.entity.Import;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ImportRepository extends JpaRepository<Import, Long> {
    List<Import> findByStatus(String status);
    List<Import> findByProvider(String provider);
    List<Import> findByImportDateBetween(LocalDateTime start, LocalDateTime end);
}
