package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.services.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    private void setTokenCookie(HttpServletResponse response, String token, int maxAgeSeconds) {
        Cookie cookie = new Cookie("token", token);
        cookie.setPath("/");
        cookie.setMaxAge(maxAgeSeconds);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        response.addCookie(cookie);
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam String name, @RequestParam String password, @RequestParam String password2, @RequestParam String email) {
        authService.register(name, email, password, password2);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestParam String email, @RequestParam String password, HttpServletResponse response) {
        String token = authService.login(email, password);

        setTokenCookie(response, token, 3600);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not logged in");
        }

        Map<String, Object> body = new HashMap<>();
        body.put("id", user.getId());
        body.put("email", user.getEmail());
        body.put("name", user.getName());
        body.put("image", user.getImage());
        body.put("isElder", user.getIsElderOwl());

        return ResponseEntity.ok(body);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        setTokenCookie(response, "", 0);
        return ResponseEntity.ok("Logged out");
    }
}
