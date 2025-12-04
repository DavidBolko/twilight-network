package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.Jwt;
import dev.bolko.twilightapi.services.InputValidatorService;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final InputValidatorService validator;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final Jwt jwt;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestParam String name, @RequestParam String password, @RequestParam String password2, @RequestParam String email) {
        User user = userRepo.findUserByEmail(email);

        String validationError = validator.validateRegistrationInput(name, email, password, password2);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(validationError);
        }

        if (user != null) {
            return ResponseEntity.badRequest().body("User already exists");
        }

        String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

        user = new User(name, email, hashedPassword);
        userRepo.save(user);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestParam String email, @RequestParam String password, HttpServletResponse response) {

        String validationError = validator.validateLoginInput(email, password);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(validationError);
        }

        User user = userRepo.findUserByEmail(email);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
        String token = jwt.generateToken(user.getEmail());
        Cookie cookie = new Cookie("token", token);
        cookie.setPath("/");
        cookie.setMaxAge(3600);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        response.addCookie(cookie);

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

    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie cookie = new Cookie("token", "");
        cookie.setPath("/");
        cookie.setMaxAge(3600);
        cookie.setHttpOnly(true);
        cookie.setSecure(false);
        response.addCookie(cookie);
        return ResponseEntity.ok("Logged out");
    }

}
