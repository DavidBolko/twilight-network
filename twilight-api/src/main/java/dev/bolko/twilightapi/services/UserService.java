package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepo;

    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser(User principal) {
        if (principal == null) {
            return Optional.empty();
        }

        return userRepo.findById(principal.getId());
    }
}
