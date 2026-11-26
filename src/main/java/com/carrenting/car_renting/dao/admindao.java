package com.carrenting.car_renting.dao;

import com.carrenting.car_renting.model.admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface admindao extends JpaRepository<admin, Integer> {
    Optional<admin> findByEmail(String email);
}
