package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.admindao;
import com.carrenting.car_renting.dao.driverlicensedao;
import com.carrenting.car_renting.dao.renterdao;
import com.carrenting.car_renting.model.admin;
import com.carrenting.car_renting.model.driverlicense;
import com.carrenting.car_renting.model.renter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/licenses")
public class driverlicensecontroller {

    private final driverlicensedao licenseDao;
    private final renterdao renterDao;
    private final admindao adminDao;

    public driverlicensecontroller(driverlicensedao licenseDao, renterdao renterDao, admindao adminDao) {
        this.licenseDao = licenseDao;
        this.renterDao = renterDao;
        this.adminDao = adminDao;
    }

    @GetMapping
    public List<driverlicense> getAllLicenses() {
        return licenseDao.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<driverlicense> getLicenseById(@PathVariable Integer id) {
        return licenseDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/renter/{userId}")
    public ResponseEntity<driverlicense> getLicenseByRenterId(@PathVariable Integer userId) {
        return licenseDao.findByRenter_UserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/status/{status}")
    public List<driverlicense> getLicensesByStatus(@PathVariable String status) {
        return licenseDao.findByVerificationStatus(status);
    }

    @PostMapping("/renter/{userId}")
    public ResponseEntity<driverlicense> createLicenseForRenter(
            @PathVariable Integer userId,
            @RequestBody driverlicense license) {
        renter foundRenter = renterDao.findById(userId).orElse(null);
        if (foundRenter == null) {
            return ResponseEntity.notFound().build();
        }
        license.setRenter(foundRenter);
        driverlicense saved = licenseDao.save(license);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<driverlicense> verifyLicense(
            @PathVariable Integer id,
            @RequestParam String status,
            @RequestParam(required = false) Integer adminId) {
        driverlicense license = licenseDao.findById(id).orElse(null);
        if (license == null) {
            return ResponseEntity.notFound().build();
        }
        if (adminId != null) {
            admin verifier = adminDao.findById(adminId).orElse(null);
            if (verifier == null) {
                return ResponseEntity.badRequest().build();
            }
            license.setVerifiedBy(verifier);
        }
        license.setVerificationStatus(status);
        return ResponseEntity.ok(licenseDao.save(license));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLicense(@PathVariable Integer id) {
        if (!licenseDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        licenseDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
