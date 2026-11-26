package com.carrenting.car_renting.dao;

import com.carrenting.car_renting.model.auditlog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface auditlogdao extends JpaRepository<auditlog, Integer> {
    List<auditlog> findByAdminEmailOrderByCreatedAtDesc(String adminEmail);

    List<auditlog> findAllByOrderByCreatedAtDesc();
}
