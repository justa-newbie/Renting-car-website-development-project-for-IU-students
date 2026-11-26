package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.userdao;
import com.carrenting.car_renting.model.user;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class usercontroller {

    private final userdao userDao;

    public usercontroller(userdao userDao) {
        this.userDao = userDao;
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
                    return ResponseEntity.ok(userDao.save(existing));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        if (!userDao.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        userDao.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
