package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.*;
import dev.bolko.twilightapi.services.UploadService;
import dev.bolko.twilightapi.utils.PostType;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/p")
@RequiredArgsConstructor
public class PostController {

    private final CommunityRepository communityRepo;
    private final PostRepository postRepo;
    private final ImagePostRepository imagePostRepo;
    private final UserRepository userRepo;
    private final UploadService uploadService;
    private final CommentRepository commentRepo;

    @PostMapping(value = "/{communityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(@PathVariable("communityId") Long communityId, @RequestParam("title") String title, @RequestParam("type") String type, @RequestParam("text") String text, @RequestParam(value = "images", required = false) MultipartFile[] images, Authentication auth) {
        Optional<Community> com = communityRepo.findById(communityId);
        if (com.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Community not found");
        }

        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        Post post = new Post(title, text, com.get());

        if (images != null && images.length > 0) {
            post.setType(PostType.IMAGE);
        } else {
            if(text.isBlank()){
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Post cannot be empty.");
            }
            post.setType(PostType.TEXT);
        }
        User author = userRepo.findById(((User) auth.getPrincipal()).getId()).orElseThrow(() -> new RuntimeException("User not found"));
        post.setAuthor(author);

        postRepo.save(post);

        if (images != null && images.length > 0) {
            try {
                for (MultipartFile image : images) {
                    String imageUrl = uploadService.uploadImage(image);
                    ImagePost imagePost = new ImagePost(imageUrl, post);
                    imagePostRepo.save(imagePost);
                }
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(post);
    }


    @GetMapping("/{id}")
    @Transactional
    public ResponseEntity<PostDto> getPost(@PathVariable("id") Long id) {
        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Hibernate.initialize(post.getLikes());
        Hibernate.initialize(post.getImagePosts());

        List<String> imagesUrl = post.getImagePosts().stream().map(image -> {
            try {
                return uploadService.getFile(image.getUrl());
            } catch (IOException e) {
                throw new RuntimeException("Image load failed: " + e.getMessage(), e);
            }
        }).toList();

        List<Comment> comments = commentRepo.findByPostId(post.getId());
        return ResponseEntity.ok(new PostDto(post, imagesUrl, comments));
    }
    @PutMapping("/{id}/like")
    public ResponseEntity<?> like(@PathVariable Long id, @AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

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

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> comment(@PathVariable("id") Long id, @RequestParam("comment") String comment, Authentication auth ) {
        Post post = postRepo.findById(id).orElse(null);

        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User user =  userRepo.findById(((User) auth.getPrincipal()).getId()).orElseThrow(() -> new RuntimeException("User not found"));

        Comment com = new Comment(comment, post, user);
        commentRepo.save(com);

        return ResponseEntity.ok(com);
    }

    @GetMapping
    public ResponseEntity<List<PostDto>> getAllPosts(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, @RequestParam(defaultValue = "createdAt,desc") String[] sort) {

        Sort sortObj = Sort.by(Sort.Direction.fromString(sort[1]), sort[0]);
        Pageable pageable = PageRequest.of(page, size, sortObj);

        Page<Post> posts = postRepo.findAll(pageable);

        List<PostDto> dtos = posts.stream().map(post -> {
            List<String> imagesUrl = post.getImagePosts().stream().map(image -> {
                try {
                    return uploadService.getFile(image.getUrl());
                } catch (IOException e) {
                    throw new RuntimeException("Image load failed: " + e.getMessage(), e);
                }
            }).toList();

            List<Comment> comments = commentRepo.findByPostId(post.getId());

            return new PostDto(post, imagesUrl, comments);
        }).toList();

        return ResponseEntity.ok(dtos);
    }

}
