package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.UserDto;
import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepo;
    private final CommentRepository commentRepo;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        User user = userRepo.findById(id).orElseThrow();
        List<Comment> allComments = commentRepo.findAll();
        return ResponseEntity.ok(new UserDto(user, allComments));
    }

    @PutMapping("/{id}/avatar")
    public ResponseEntity<String> changeUserAvatar(@PathVariable UUID id, @RequestParam String key) {
        User user = userRepo.findById(id).orElseThrow();
        user.setImage(key);
        userRepo.save(user);
        return ResponseEntity.status(HttpStatus.OK).body(key);
    }

    @PutMapping("/{id}/description")
    public ResponseEntity<String> changeUserDescription(@PathVariable UUID id, @RequestParam String description) {
        User user = userRepo.findById(id).orElseThrow();
        user.setDescription(description);
        userRepo.save(user);
        return ResponseEntity.status(HttpStatus.OK).body(description);
    }

}
