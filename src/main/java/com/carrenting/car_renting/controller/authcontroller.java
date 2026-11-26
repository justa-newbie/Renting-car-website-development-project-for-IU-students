package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.userdao;
import com.carrenting.car_renting.filter.authfilter;
import com.carrenting.car_renting.model.admin;
import com.carrenting.car_renting.model.user;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class authcontroller {

    private final userdao userDao;
    private final PasswordEncoder passwordEncoder;

    public authcontroller(userdao userDao, PasswordEncoder passwordEncoder) {
        this.userDao = userDao;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> credentials,
            HttpServletRequest request) {

        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        user foundUser = userDao.findByEmail(email).orElse(null);
        if (foundUser == null || !passwordEncoder.matches(password, foundUser.getPasswordHash())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password."));
        }

        if (!foundUser.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account is deactivated."));
        }

        foundUser.setLastLogin(LocalDateTime.now());
        userDao.save(foundUser);

        String resolvedRole = (foundUser instanceof admin) ? "ADMIN" : "USER";

        HttpSession session = request.getSession(true);
        session.setAttribute(authfilter.SESSION_USER_ID, foundUser.getUserId());
        session.setAttribute(authfilter.SESSION_USER_EMAIL, foundUser.getEmail());
        session.setAttribute(authfilter.SESSION_USER_ROLE, resolvedRole);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "userId", foundUser.getUserId(),
                "fullName", foundUser.getFullName(),
                "email", foundUser.getEmail(),
                "role", resolvedRole
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<?> currentUser(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute(authfilter.SESSION_USER_ID) == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Not logged in."));
        }
        return ResponseEntity.ok(Map.of(
                "userId", session.getAttribute(authfilter.SESSION_USER_ID),
                "email", session.getAttribute(authfilter.SESSION_USER_EMAIL),
                "role", session.getAttribute(authfilter.SESSION_USER_ROLE)
        ));
    }
}
