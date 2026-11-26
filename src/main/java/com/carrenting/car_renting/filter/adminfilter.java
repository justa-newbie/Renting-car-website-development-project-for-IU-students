package com.carrenting.car_renting.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class adminfilter extends OncePerRequestFilter {

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        boolean isAdminRoute = path.startsWith("/api/admins")
                || path.startsWith("/api/users")
                || (path.startsWith("/api/licenses/") && path.endsWith("/verify"));
        return !isAdminRoute;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        HttpSession session = request.getSession(false);
        String role = session != null ? (String) session.getAttribute(authfilter.SESSION_USER_ROLE) : null;

        if (!"ADMIN".equals(role)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Forbidden. Admin access required.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}
