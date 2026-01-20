package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunityDto;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.services.CommunityService;
import dev.bolko.twilightapi.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityService communityService;
    private final UserService userService;

    // --------- CREATE ---------
    @PostMapping("/create")
    public ResponseEntity<CommunityDto> createCommunity(@RequestParam("name") String name, @RequestParam("description") String description, @RequestParam(value = "categoryId", required = false) Long categoryId, @RequestParam(value = "image", required = false) MultipartFile image, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        return ResponseEntity.status(HttpStatus.CREATED).body(communityService.create(name, description, categoryId, image, me));
    }

    // --------- READ  ---------
    @GetMapping("/{id}")
    public ResponseEntity<CommunityDto> getCommunity(@PathVariable Long id) {
        return ResponseEntity.ok(communityService.getCommunity(id));
    }

    @GetMapping
    public ResponseEntity<List<CommunityDto>> list(@RequestParam(required = false) String query, @RequestParam(required = false) Long categoryId) {
        return ResponseEntity.ok(communityService.list(query, categoryId));
    }

    // --------- UPDATE  ---------
    @PutMapping("/join/{id}")
    public ResponseEntity<?> join(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        communityService.joinUser(id, me);
        return ResponseEntity.ok().build();
    }


}
