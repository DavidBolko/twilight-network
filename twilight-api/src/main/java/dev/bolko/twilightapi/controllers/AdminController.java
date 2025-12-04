package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepo;

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        Page<User> usersPage = userRepo.findAll(PageRequest.of(page, size));
        System.out.println(usersPage.getContent());
        return ResponseEntity.ok(
                Map.of(
                        "users", usersPage.getContent(),
                        "page", usersPage.getNumber(),
                        "size", usersPage.getSize(),
                        "totalPages", usersPage.getTotalPages(),
                        "totalUsers", usersPage.getTotalElements()
                )
        );
    }

    @PutMapping("/users/{id}/promote")
    public ResponseEntity<?> promoteUserToElder(@PathVariable UUID id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Object principal = auth != null ? auth.getPrincipal() : null;

        if (!(principal instanceof User currentUser)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Unauthorized");
        }
        if (currentUser.getIsElderOwl() == null || !currentUser.getIsElderOwl()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only elders can promote other users.");
        }

        Optional<User> targetOpt = userRepo.findById(id);
        if (targetOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        User target = targetOpt.get();

        if (target.getId().equals(currentUser.getId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("You cannot promote yourself.");
        }

        target.setIsElderOwl(true);
        userRepo.save(target);

        return ResponseEntity.status(HttpStatus.OK).body("User promoted.");
    }
}
