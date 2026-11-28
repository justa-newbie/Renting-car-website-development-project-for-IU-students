package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.admindao;
import com.carrenting.car_renting.dao.driverlicensedao;
import com.carrenting.car_renting.dao.renterdao;
import com.carrenting.car_renting.filter.authfilter;
import com.carrenting.car_renting.model.admin;
import com.carrenting.car_renting.model.driverlicense;
import com.carrenting.car_renting.model.renter;
import com.carrenting.car_renting.util.auditlogger;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/licenses")
public class driverlicensecontroller {

    private static final Set<String> VALID_STATUSES = Set.of("PENDING", "APPROVED", "REJECTED");

    private final driverlicensedao licenseDao;
    private final renterdao renterDao;
    private final admindao adminDao;
    private final auditlogger auditLogger;

    public driverlicensecontroller(
            driverlicensedao licenseDao,
            renterdao renterDao,
            admindao adminDao,
            auditlogger auditLogger) {
        this.licenseDao = licenseDao;
        this.renterDao = renterDao;
        this.adminDao = adminDao;
        this.auditLogger = auditLogger;
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
        if (licenseDao.findByRenter_UserId(userId).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        license.setRenter(foundRenter);
        license.setVerificationStatus("PENDING");
        license.setVerifiedBy(null);
        driverlicense saved = licenseDao.save(license);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<driverlicense> verifyLicense(
            @PathVariable Integer id,
            @RequestParam String status,
            @RequestParam(required = false) Integer adminId,
            HttpServletRequest request) {
        String normalizedStatus = status != null ? status.trim().toUpperCase() : "";
        if (!VALID_STATUSES.contains(normalizedStatus)) {
            return ResponseEntity.badRequest().build();
        }
        driverlicense license = licenseDao.findById(id).orElse(null);
        if (license == null) {
            return ResponseEntity.notFound().build();
        }
        Integer resolvedAdminId = adminId;
        if (resolvedAdminId == null) {
            HttpSession session = request.getSession(false);
            if (session != null) {
                resolvedAdminId = (Integer) session.getAttribute(authfilter.SESSION_USER_ID);
            }
        }
        if (resolvedAdminId != null) {
            admin verifier = adminDao.findById(resolvedAdminId).orElse(null);
            if (verifier == null) {
                return ResponseEntity.badRequest().build();
            }
            license.setVerifiedBy(verifier);
        }
        license.setVerificationStatus(normalizedStatus);
        driverlicense saved = licenseDao.save(license);
        auditLogger.logCurrentAdmin("VERIFY_LICENSE", "DRIVER_LICENSE", String.valueOf(id),
                "Set verificationStatus=" + normalizedStatus);
        return ResponseEntity.ok(saved);
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
