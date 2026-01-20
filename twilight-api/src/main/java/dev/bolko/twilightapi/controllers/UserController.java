package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunityItemDto;
import dev.bolko.twilightapi.dto.UserDto;
import dev.bolko.twilightapi.model.User;
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

    // --------- READ ---------

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @GetMapping("/owned")
    public ResponseEntity<List<CommunityItemDto>> getOwned(@AuthenticationPrincipal User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        return ResponseEntity.ok(userService.getOwnedCommunities(principal));
    }

    @GetMapping("/joined")
    public ResponseEntity<List<CommunityItemDto>> getJoined(@AuthenticationPrincipal User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        return ResponseEntity.ok(userService.getJoinedCommunities(principal));
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserDto>> searchUsers(@RequestParam String query) {
        return ResponseEntity.ok(userService.getUser(query));
    }

    // --------- UPDATE ---------
    @PutMapping("/{id}/avatar")
    public ResponseEntity<String> changeUserAvatar(@PathVariable UUID id, @RequestParam("file") MultipartFile file, @AuthenticationPrincipal User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        if (!principal.getId().equals(id)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");

        try {
            String filename = userService.changeAvatar(id, file);
            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload avatar");
        }
    }

    @PutMapping("/{id}/description")
    public ResponseEntity<String> changeUserDescription(@PathVariable UUID id, @RequestParam String description, @AuthenticationPrincipal User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        if (!principal.getId().equals(id)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");

        return ResponseEntity.ok(userService.changeDescription(id, description));
    }


}
