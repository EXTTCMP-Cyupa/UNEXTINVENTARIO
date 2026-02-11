package com.fixme.ecosystem.repository;

import com.fixme.ecosystem.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    Optional<InventoryItem> findBySerialNumber(String serialNumber);
    Optional<InventoryItem> findByInternalCode(String internalCode);
    List<InventoryItem> findByStatus(String status);
    List<InventoryItem> findByImportRecordId(Long importId);
}
