package com.fixme.ecosystem.repository;

import com.fixme.ecosystem.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SaleRepository extends JpaRepository<Sale, Long> {
    Optional<Sale> findByInventoryItemId(Long inventoryItemId);
    List<Sale> findAllByOrderBySaleDateDesc();
    List<Sale> findBySaleType(String saleType);
}
