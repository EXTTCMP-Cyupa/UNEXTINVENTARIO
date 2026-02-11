package com.fixme.ecosystem.repository;

import com.fixme.ecosystem.entity.Warranty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface WarrantyRepository extends JpaRepository<Warranty, Long> {
    Optional<Warranty> findByInventoryItemId(Long inventoryItemId);
    Optional<Warranty> findByQrToken(String qrToken);
}
