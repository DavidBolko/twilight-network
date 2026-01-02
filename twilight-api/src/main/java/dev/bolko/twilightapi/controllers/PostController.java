package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.services.ImageService;
import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.*;
import dev.bolko.twilightapi.services.InputValidatorService;
import dev.bolko.twilightapi.services.UserService;
import dev.bolko.twilightapi.utils.PostType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;


@RestController
@RequestMapping("/api/p")
@RequiredArgsConstructor
public class PostController {
    private final InputValidatorService validator;
    private final UserService userService;
    private final CommunityRepository communityRepo;
    private final PostRepository postRepo;
    private final ImagePostRepository imagePostRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final ImageService imageService;

    @PostMapping("/{communityId}")
    public ResponseEntity<?> createPost(@PathVariable("communityId") Long communityId, @RequestParam(value = "text", required = false) String text, @RequestParam(value = "images", required = false) List<MultipartFile> images, @AuthenticationPrincipal User principal) {
        var userOpt = userService.getCurrentUser(principal);
        if (userOpt.isEmpty()) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        User user = userOpt.get();

        Community community = communityRepo.findById(communityId).orElse(null);
        if (community == null) return ResponseEntity.badRequest().body("Community not found");

        String err = validator.validatePostInput(text, images);
        if (err != null) return ResponseEntity.badRequest().body(err);

        boolean hasText = text != null && !text.trim().isEmpty();
        boolean hasImages = images != null && !images.isEmpty();

        Post post = new Post();
        post.setCommunity(community);
        post.setAuthor(user);
        post.setText(hasText ? text.trim() : null);

        post.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

        if (hasImages) {
            try {
                post.getImagePosts().addAll(imageService.saveImages(images, post));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed.");
            }
        }

        postRepo.save(post);

        return ResponseEntity.status(HttpStatus.CREATED).body(new PostDto(post, List.of(), user));
    }


    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        var user = userService.getCurrentUser(principal);

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        List<Comment> comments = commentRepo.findByPostId(post.getId());

        return ResponseEntity.ok(new PostDto(post, comments, user.orElse(null)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        if (!post.getAuthor().getId().equals(user.getId()) && !Boolean.TRUE.equals(user.getIsElderOwl())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete this post");
        }

        List<String> images = new ArrayList<>(
                post.getImagePosts().stream().map(ImagePost::getUrl).toList()
        );
        imageService.deleteImages(images);
        imagePostRepo.deleteAll(post.getImagePosts());

        post.setDeletedAt(LocalDateTime.now());
        postRepo.save(post);

        return ResponseEntity.ok().build();
    }


    @PutMapping("/{id}/like")
    public ResponseEntity<?> like(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Set<User> likesCopy = new HashSet<>(post.getLikes());

        if (likesCopy.contains(user)) {
            likesCopy.remove(user);
        } else {
            likesCopy.add(user);
        }

        post.setLikes(likesCopy);
        postRepo.save(post);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/save")
    public ResponseEntity<?> savePost(@PathVariable Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Set<Post> savedPosts = user.getSavedPosts();

        if (savedPosts.contains(post)) {
            savedPosts.remove(post);
        } else {
            savedPosts.add(post);
        }

        user.setSavedPosts(savedPosts);
        userRepo.save(user);

        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> comment(@PathVariable("id") Long id, @RequestParam("comment") String comment, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElse(null);
        if(comment.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Comment cannot be empty");
        }

        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        Comment com = new Comment(comment, post, user);
        commentRepo.save(com);

        return ResponseEntity.ok(com.getContent());
    }



    @GetMapping
    public ResponseEntity<?> getAllPosts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdAt,desc") String[] sort, @AuthenticationPrincipal User principal) {
        var user = userService.getCurrentUser(principal);

        Sort sortObj = Sort.by(Sort.Direction.fromString(sort[1]), sort[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Post> posts = postRepo.findAll(pageable);

        List<PostDto> dtos = posts.stream()
                .map(post -> {
                    List<Comment> comments = commentRepo.findByPostId(post.getId());
                    return new PostDto(post, comments, user.orElse(null));
                })
                .toList();

        return ResponseEntity.ok(dtos);
    }





}
