package dev.bolko.twilightapi;

import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final Jwt jwt;
    private final UserRepository userRepository;

    public JwtAuthFilter(Jwt jwt, UserRepository userRepository) {
        this.jwt = jwt;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String token = null;

        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if (cookie.getName().equals("token")) {
                    token = cookie.getValue();
                }
            }
        }
        System.out.println("token: " + token);
        if (token != null) {
            try {



                String email = jwt.extractUsername(token);

                User user = userRepository.findUserByEmail(email);
                if (jwt.isTokenValid(token, user)) {
                    List<SimpleGrantedAuthority> authorities = new ArrayList<>();

                    if (Boolean.TRUE.equals(user.getIsElderOwl())) {
                        authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
                    }

                    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

                    var auth = new UsernamePasswordAuthenticationToken(user, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (Exception ignored) {
            }
        }

        filterChain.doFilter(request, response);
    }
}
