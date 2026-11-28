package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.userdao;
import com.carrenting.car_renting.model.user;
import com.carrenting.car_renting.util.auditlogger;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class usercontroller {

    private final userdao userDao;
    private final auditlogger auditLogger;

    public usercontroller(userdao userDao, auditlogger auditLogger) {
        this.userDao = userDao;
        this.auditLogger = auditLogger;
    }

    @GetMapping
    public List<user> getAllUsers() {
        return userDao.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<user> getUserById(@PathVariable Integer id) {
        return userDao.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<user> getUserByEmail(@PathVariable String email) {
        return userDao.findByEmail(email)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<user> updateActiveStatus(@PathVariable Integer id, @RequestParam boolean active) {
        return userDao.findById(id)
                .map(existing -> {
                    existing.setActive(active);
                    user saved = userDao.save(existing);
                    auditLogger.logCurrentAdmin("UPDATE_USER_STATUS", "USER", String.valueOf(id),
                            "Set active=" + active);
                    return ResponseEntity.ok(saved);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        if (!userDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userDao.deleteById(id);
        auditLogger.logCurrentAdmin("DELETE_USER", "USER", String.valueOf(id), "Deleted user");
        return ResponseEntity.noContent().build();
    }
}
