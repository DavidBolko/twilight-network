package dev.bolko.twilightapi.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import dev.bolko.twilightapi.Jwt;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final InputValidatorService validator;
    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final Jwt jwt;

    public void register(String name, String email, String password, String password2) {
        String validationError = validator.validateRegistrationInput(name, email, password, password2);
        if (validationError != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, validationError);

        User existing = userRepo.findUserByEmail(email);
        if (existing != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User already exists");

        String hashed = passwordEncoder.encode(password);
        User user = new User(name, email, hashed);
        userRepo.save(user);
    }

    public String login(String email, String password) {
        String validationError = validator.validateLoginInput(email, password);
        if (validationError != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, validationError);

        User user = userRepo.findUserByEmail(email);
        if (user == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }

        return jwt.generateToken(user.getEmail());
    }
}