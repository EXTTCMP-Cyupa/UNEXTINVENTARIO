package com.fixme.ecosystem.repository;

import com.fixme.ecosystem.entity.PriceRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PriceRuleRepository extends JpaRepository<PriceRule, Long> {
    Optional<PriceRule> findByRoleAndActiveTrue(String role);
}
