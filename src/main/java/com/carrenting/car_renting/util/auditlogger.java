package com.carrenting.car_renting.util;

import com.carrenting.car_renting.dao.auditlogdao;
import com.carrenting.car_renting.model.auditlog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class auditlogger {

    private static final Logger log = LoggerFactory.getLogger(auditlogger.class);

    private final auditlogdao auditLogDao;

    public auditlogger(auditlogdao auditLogDao) {
        this.auditLogDao = auditLogDao;
    }

    public void log(String adminEmail, String action, String targetType, String targetId, String details) {
        String actor = (adminEmail != null && !adminEmail.isBlank()) ? adminEmail : "SYSTEM";
        log.info("[ADMIN AUDIT] actor={} action={} targetType={} targetId={} details={}",
                actor, action, targetType, targetId, details);

        auditlog entry = new auditlog();
        entry.setAdminEmail(actor);
        entry.setAction(action);
        entry.setTargetType(targetType);
        entry.setTargetId(targetId);
        entry.setDetails(details);
        auditLogDao.save(entry);
    }

    public void logCurrentAdmin(String action, String targetType, String targetId, String details) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String adminEmail = (auth != null && auth.getPrincipal() != null) ? auth.getPrincipal().toString() : "SYSTEM";
        log(adminEmail, action, targetType, targetId, details);
    }
}
