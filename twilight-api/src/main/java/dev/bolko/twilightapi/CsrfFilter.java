package dev.bolko.twilightapi;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
public class CsrfFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        String method = req.getMethod();
        if ("GET".equals(method) || "HEAD".equals(method) || "OPTIONS".equals(method)) {
            chain.doFilter(req, res);
            return;
        }

        String cookieToken = null;
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("XSRF-TOKEN".equals(c.getName())) {
                    cookieToken = c.getValue();
                    break;
                }
            }
        }

        String headerToken = req.getHeader("X-XSRF-TOKEN");

        if (cookieToken == null || !cookieToken.equals(headerToken)) {
            res.sendError(HttpServletResponse.SC_FORBIDDEN, "CSRF token missing/invalid");
            return;
        }

        chain.doFilter(req, res);
    }
}
