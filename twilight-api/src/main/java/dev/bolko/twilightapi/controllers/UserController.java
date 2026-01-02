package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.services.ImageService;
import dev.bolko.twilightapi.dto.UserDto;
import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ImageService imageService;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        User user = userRepo.findById(id).orElseThrow();
        List<Comment> allComments = commentRepo.findAll();
        return ResponseEntity.ok(new UserDto(user, allComments));
    }


    @PutMapping("/{id}/avatar")
    public ResponseEntity<String> changeUserAvatar(@PathVariable UUID id, @RequestParam("file") MultipartFile file, @AuthenticationPrincipal User principal) {
        User principalUser = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        boolean isSelf = principalUser.getId().equals(id);
        if (!isSelf) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        try {
            User user = userRepo.findById(id).orElseThrow();

            String filename = imageService.saveImage(file);
            user.setImage(filename);

            userRepo.save(user);

            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload avatar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/description")
    public ResponseEntity<String> changeUserDescription(@PathVariable UUID id, @RequestParam String description, @AuthenticationPrincipal User principal) {
        User principalUser = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        boolean isSelf = principalUser.getId().equals(id);
        if (!isSelf) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        User user = userRepo.findById(id).orElseThrow();
        user.setDescription(description);
        userRepo.save(user);

        return ResponseEntity.ok(description);
    }



}
