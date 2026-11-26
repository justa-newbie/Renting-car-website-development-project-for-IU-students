package com.carrenting.car_renting.dao;

import com.carrenting.car_renting.model.driverlicense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface driverlicensedao extends JpaRepository<driverlicense, Integer> {
    Optional<driverlicense> findByRenter_UserId(Integer userId);

    Optional<driverlicense> findByLicenseNumber(String licenseNumber);

    List<driverlicense> findByVerificationStatus(String verificationStatus);

    boolean existsByLicenseNumber(String licenseNumber);
}
