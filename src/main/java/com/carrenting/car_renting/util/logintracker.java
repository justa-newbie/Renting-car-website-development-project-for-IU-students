package com.carrenting.car_renting.util;

import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class logintracker {

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_DURATION_MINUTES = 15;

    private static class attemptinfo {
        int failedAttempts;
        LocalDateTime lockedUntil;
    }

    private final ConcurrentHashMap<String, attemptinfo> attempts = new ConcurrentHashMap<>();

    public void recordSuccess(String key) {
        if (key != null) {
            attempts.remove(key.toLowerCase());
        }
    }

    public void recordFailure(String key) {
        if (key == null) {
            return;
        }
        String normalized = key.toLowerCase();
        attempts.compute(normalized, (k, info) -> {
            if (info == null) {
                info = new attemptinfo();
            }
            if (info.lockedUntil != null && LocalDateTime.now().isAfter(info.lockedUntil)) {
                info.failedAttempts = 0;
                info.lockedUntil = null;
            }
            info.failedAttempts++;
            if (info.failedAttempts >= MAX_ATTEMPTS) {
                info.lockedUntil = LocalDateTime.now().plusMinutes(LOCK_DURATION_MINUTES);
            }
            return info;
        });
    }

    public boolean isBlocked(String key) {
        if (key == null) {
            return false;
        }
        String normalized = key.toLowerCase();
        attemptinfo info = attempts.get(normalized);
        if (info == null || info.lockedUntil == null) {
            return false;
        }
        if (LocalDateTime.now().isAfter(info.lockedUntil)) {
            attempts.remove(normalized);
            return false;
        }
        return true;
    }

    public int getRemainingAttempts(String key) {
        if (key == null) {
            return MAX_ATTEMPTS;
        }
        attemptinfo info = attempts.get(key.toLowerCase());
        if (info == null) {
            return MAX_ATTEMPTS;
        }
        return Math.max(0, MAX_ATTEMPTS - info.failedAttempts);
    }
}
