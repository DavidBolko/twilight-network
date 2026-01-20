package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.services.PostService;
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
@RequestMapping("/api/p")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final UserService userService;

    // --------- CREATE ---------

    @PostMapping("/{communityId}")
    public ResponseEntity<PostDto> createPost(@PathVariable Long communityId, @RequestParam(value = "text", required = false) String text, @RequestParam(value = "images", required = false) List<MultipartFile> images, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        return ResponseEntity.status(HttpStatus.CREATED).body(postService.create(communityId, text, images, me));
    }

    // --------- READ  ---------

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User meOrNull = userService.getCurrentUser(principal).orElse(null);
        return ResponseEntity.ok(postService.getOne(id, meOrNull));
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> feed(@RequestParam(required = false) Long communityId, @RequestParam(defaultValue = "hot") String sort, @RequestParam(defaultValue = "week") String time, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @AuthenticationPrincipal User principal) {
        User meOrNull = userService.getCurrentUser(principal).orElse(null);
        return ResponseEntity.ok(postService.feed(communityId, sort, time, page, size, meOrNull));
    }


    // --------- UPDATE ---------

    @PutMapping("/{id}")
    public ResponseEntity<PostDto> updatePost(@PathVariable Long id, @RequestParam(value = "text", required = false) String text, @RequestParam(value = "images", required = false) List<MultipartFile> images, @RequestParam(value = "removeImageIds", required = false) List<String> removeImageIds, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        return ResponseEntity.ok(postService.update(id, text, images, removeImageIds, me));
    }

    @PutMapping("/{id}/like")
    public ResponseEntity<?> like(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        postService.toggleLike(id, me);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/save")
    public ResponseEntity<?> save(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        postService.toggleSave(id, me);
        return ResponseEntity.ok().build();
    }


    // --------- DELETE ---------

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        postService.delete(id, me);
    }


}
