package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.renterdao;
import com.carrenting.car_renting.model.renter;
import com.carrenting.car_renting.util.passwordutil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/renters")
public class rentercontroller {

    private final renterdao renterDao;
    private final passwordutil passwordUtil;

    public rentercontroller(renterdao renterDao, passwordutil passwordUtil) {
        this.renterDao = renterDao;
        this.passwordUtil = passwordUtil;
    }

    @GetMapping
    public List<renter> getAllRenters() {
        return renterDao.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<renter> getRenterById(@PathVariable Integer id) {
        return renterDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<renter> createRenter(@RequestBody renter newRenter) {
        if (newRenter.getPasswordHash() == null || newRenter.getPasswordHash().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        newRenter.setPasswordHash(passwordUtil.hashPassword(newRenter.getPasswordHash()));
        renter saved = renterDao.save(newRenter);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<renter> updateRenter(@PathVariable Integer id, @RequestBody renter updated) {
        return renterDao.findById(id)
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
                    return ResponseEntity.ok(renterDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRenter(@PathVariable Integer id) {
        if (!renterDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        renterDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
