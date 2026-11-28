package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.admindao;
import com.carrenting.car_renting.dao.auditlogdao;
import com.carrenting.car_renting.model.admin;
import com.carrenting.car_renting.model.auditlog;
import com.carrenting.car_renting.util.auditlogger;
import com.carrenting.car_renting.util.passwordutil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class admincontroller {

    private final admindao adminDao;
    private final passwordutil passwordUtil;
    private final auditlogger auditLogger;
    private final auditlogdao auditLogDao;

    public admincontroller(
            admindao adminDao,
            passwordutil passwordUtil,
            auditlogger auditLogger,
            auditlogdao auditLogDao) {
        this.adminDao = adminDao;
        this.passwordUtil = passwordUtil;
        this.auditLogger = auditLogger;
        this.auditLogDao = auditLogDao;
    }

    @GetMapping
    public List<admin> getAllAdmins() {
        return adminDao.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<admin> getAdminById(@PathVariable Integer id) {
        return adminDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<admin> createAdmin(@RequestBody admin newAdmin) {
        if (newAdmin.getPasswordHash() == null || newAdmin.getPasswordHash().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        newAdmin.setPasswordHash(passwordUtil.hashPassword(newAdmin.getPasswordHash()));
        admin saved = adminDao.save(newAdmin);
        auditLogger.logCurrentAdmin("CREATE_ADMIN", "ADMIN", String.valueOf(saved.getUserId()),
                "Created admin " + saved.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<admin> updateAdmin(@PathVariable Integer id, @RequestBody admin updated) {
        return adminDao.findById(id)
                .map(existing -> {
                    if (updated.getFullName() != null) {
                        existing.setFullName(updated.getFullName());
                    }
                    if (updated.getEmail() != null) {
                        existing.setEmail(updated.getEmail());
                    }
                    if (updated.getPhoneNumber() != null) {
                        existing.setPhoneNumber(updated.getPhoneNumber());
                    }
                    existing.setActive(updated.isActive());
                    admin saved = adminDao.save(existing);
                    auditLogger.logCurrentAdmin("UPDATE_ADMIN", "ADMIN", String.valueOf(id),
                            "Updated admin " + saved.getEmail());
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        if (!adminDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        adminDao.deleteById(id);
        auditLogger.logCurrentAdmin("DELETE_ADMIN", "ADMIN", String.valueOf(id), "Deleted admin");
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/audit-logs")
    public List<auditlog> getAuditLogs() {
        return auditLogDao.findAllByOrderByCreatedAtDesc();
    }
}
