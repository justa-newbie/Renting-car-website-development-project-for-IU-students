package com.carrenting.car_renting.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Optional;

@Component
public class cookieutil {

    public void addCookie(HttpServletResponse response, String name, String value, int maxAgeSeconds, boolean httpOnly) {
        Cookie cookie = new Cookie(name, value);
        cookie.setPath("/");
        cookie.setHttpOnly(httpOnly);
        cookie.setMaxAge(maxAgeSeconds);
        response.addCookie(cookie);
    }

    public Optional<String> getCookieValue(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return Optional.empty();
        }
        return Arrays.stream(cookies)
                .filter(c -> name.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst();
    }

    public void deleteCookie(HttpServletResponse response, String name) {
        Cookie cookie = new Cookie(name, "");
        cookie.setPath("/");
        cookie.setHttpOnly(true);
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
