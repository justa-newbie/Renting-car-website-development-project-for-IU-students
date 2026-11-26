package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.admindao;
import com.carrenting.car_renting.model.admin;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admins")
public class admincontroller {

    private final admindao adminDao;
    private final PasswordEncoder passwordEncoder;

    public admincontroller(admindao adminDao, PasswordEncoder passwordEncoder) {
        this.adminDao = adminDao;
        this.passwordEncoder = passwordEncoder;
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
        newAdmin.setPasswordHash(passwordEncoder.encode(newAdmin.getPasswordHash()));
        admin saved = adminDao.save(newAdmin);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<admin> updateAdmin(@PathVariable Integer id, @RequestBody admin updated) {
        return adminDao.findById(id)
                .map(existing -> {
                    existing.setFullName(updated.getFullName());
                    existing.setEmail(updated.getEmail());
                    existing.setPhoneNumber(updated.getPhoneNumber());
                    existing.setActive(updated.isActive());
                    return ResponseEntity.ok(adminDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Integer id) {
        if (!adminDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        adminDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
