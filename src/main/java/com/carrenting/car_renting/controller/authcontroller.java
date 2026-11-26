package com.carrenting.car_renting.controller;

import com.carrenting.car_renting.dao.userdao;
import com.carrenting.car_renting.filter.authfilter;
import com.carrenting.car_renting.model.admin;
import com.carrenting.car_renting.model.user;
import com.carrenting.car_renting.util.cookieutil;
import com.carrenting.car_renting.util.logintracker;
import com.carrenting.car_renting.util.passwordutil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class authcontroller {

    private static final String AUTH_ROLE_COOKIE = "AUTH_ROLE";

    private final userdao userDao;
    private final passwordutil passwordUtil;
    private final logintracker loginTracker;
    private final cookieutil cookieUtil;

    public authcontroller(
            userdao userDao,
            passwordutil passwordUtil,
            logintracker loginTracker,
            cookieutil cookieUtil) {
        this.userDao = userDao;
        this.passwordUtil = passwordUtil;
        this.loginTracker = loginTracker;
        this.cookieUtil = cookieUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> credentials,
            HttpServletRequest request,
            HttpServletResponse response) {

        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required."));
        }

        if (loginTracker.isBlocked(email)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", "Too many failed login attempts. Try again later."));
        }

        user foundUser = userDao.findByEmail(email).orElse(null);
        if (foundUser == null || !passwordUtil.matches(password, foundUser.getPasswordHash())) {
            loginTracker.recordFailure(email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "error", "Invalid email or password.",
                            "remainingAttempts", loginTracker.getRemainingAttempts(email)
                    ));
        }

        if (!foundUser.isActive()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Account is deactivated."));
        }

        loginTracker.recordSuccess(email);
        foundUser.setLastLogin(LocalDateTime.now());
        userDao.save(foundUser);

        String resolvedRole = (foundUser instanceof admin) ? "ADMIN" : "USER";

        HttpSession session = request.getSession(true);
        session.setAttribute(authfilter.SESSION_USER_ID, foundUser.getUserId());
        session.setAttribute(authfilter.SESSION_USER_EMAIL, foundUser.getEmail());
        session.setAttribute(authfilter.SESSION_USER_ROLE, resolvedRole);

        cookieUtil.addCookie(response, AUTH_ROLE_COOKIE, resolvedRole, 3600, true);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "userId", foundUser.getUserId(),
                "fullName", foundUser.getFullName(),
                "email", foundUser.getEmail(),
                "role", resolvedRole
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        cookieUtil.deleteCookie(response, AUTH_ROLE_COOKIE);
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
