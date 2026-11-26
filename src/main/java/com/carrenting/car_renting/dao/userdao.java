package com.carrenting.car_renting.dao;

import com.carrenting.car_renting.model.user;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface userdao extends JpaRepository<user, Integer> {
    Optional<user> findByEmail(String email);

    Optional<user> findByPhoneNumber(String phoneNumber);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    List<user> findByIsActive(boolean isActive);
}
