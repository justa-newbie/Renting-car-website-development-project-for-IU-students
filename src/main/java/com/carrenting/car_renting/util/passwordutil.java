package com.carrenting.car_renting.util;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class passwordutil {

    private static final String CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final PasswordEncoder passwordEncoder;

    public passwordutil(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean matches(String rawPassword, String encodedPassword) {
        return passwordEncoder.matches(rawPassword, encodedPassword);
    }

    public String generateRandomPassword(int length) {
        int len = Math.max(length, 8);
        StringBuilder sb = new StringBuilder(len);
        for (int i = 0; i < len; i++) {
            sb.append(CHARS.charAt(RANDOM.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
