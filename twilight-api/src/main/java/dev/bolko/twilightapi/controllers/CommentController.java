package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.services.CommentService;
import dev.bolko.twilightapi.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/p/{postId}/comments")
public class CommentController {

    private final CommentService commentService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<?> add(@PathVariable Long postId, @RequestParam("comment") String content, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        return ResponseEntity.ok(commentService.addComment(postId, content, me));
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> update(@PathVariable Long postId, @PathVariable Long commentId, @RequestBody String text, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        return ResponseEntity.ok(commentService.updateComment(postId, commentId, text, me));
    }

    @DeleteMapping("/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long postId, @PathVariable Long commentId, @AuthenticationPrincipal User principal) {
        User me = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        commentService.deleteComment(postId, commentId, me);
    }
}
