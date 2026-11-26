package com.carrenting.car_renting.dao;

import com.carrenting.car_renting.model.renter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface renterdao extends JpaRepository<renter, Integer> {
    Optional<renter> findByEmail(String email);

    Optional<renter> findByPhoneNumber(String phoneNumber);
}
