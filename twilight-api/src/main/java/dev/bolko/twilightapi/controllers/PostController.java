package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.services.ImageService;
import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.*;
import dev.bolko.twilightapi.services.InputValidatorService;
import dev.bolko.twilightapi.services.UserService;
import dev.bolko.twilightapi.utils.PostType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;


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

    @Transactional
    @PutMapping(value = "/{id}")
    public ResponseEntity<?> updatePost(@PathVariable Long id, @RequestParam(value = "text", required = false) String text, @RequestParam(value = "images", required = false) List<MultipartFile> images, @RequestParam(value = "removeImageIds", required = false) List<String> removeImageIds, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean canEdit = post.getAuthor().getId().equals(user.getId()) || Boolean.TRUE.equals(user.getIsElderOwl());
        if (!canEdit) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot edit this post");

        // 1) text (trim + null)
        if (text != null) {
            String t = text.trim();
            post.setText(t.isEmpty() ? null : t);
        }

        // 2) remove existing images (podľa URL/id)
        if (removeImageIds != null && !removeImageIds.isEmpty()) {
            Set<String> remove = new HashSet<>(removeImageIds);
            List<String> toDeleteFromStorage = new ArrayList<>();

            Iterator<ImagePost> it = post.getImagePosts().iterator();
            while (it.hasNext()) {
                ImagePost ip = it.next();
                if (remove.contains(ip.getUrl())) {
                    toDeleteFromStorage.add(ip.getUrl());
                    it.remove();
                }
            }

            if (!toDeleteFromStorage.isEmpty()) {
                imageService.deleteImages(toDeleteFromStorage);
            }
        }

        // 3) skontroluj max 10 (existujúce po remove + nové)
        int currentCount = post.getImagePosts() == null ? 0 : post.getImagePosts().size();
        int addCount = images == null ? 0 : images.size();
        if (currentCount + addCount > 10) {
            return ResponseEntity.badRequest().body("You can upload a maximum of 10 images.");
        }

        // 4) validuj nové obrázky (size/type) – použij existujúci validátor
        if (images != null && !images.isEmpty()) {
            String imgErr = validator.validatePostInput(null, images);
            if (imgErr != null) return ResponseEntity.badRequest().body(imgErr);
        }

        // 5) pridaj nové obrázky (rovnako ako create)
        if (images != null && !images.isEmpty()) {
            try {
                post.getImagePosts().addAll(imageService.saveImages(images, post));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed.");
            }
        }

        // 6) validuj výsledný post (text + existujúce obrázky)
        boolean hasImagesNow = post.getImagePosts() != null && !post.getImagePosts().isEmpty();
        String err = validator.validatePostInput(post.getText(), hasImagesNow);
        if (err != null) return ResponseEntity.badRequest().body(err);

        // 7) prepočítaj type
        boolean hasTextNow = post.getText() != null && !post.getText().trim().isEmpty();
        post.setType(hasTextNow && hasImagesNow ? PostType.MIXED : hasImagesNow ? PostType.IMAGE : PostType.TEXT);

        postRepo.save(post);

        List<Comment> comments = commentRepo.findByPostId(post.getId());
        return ResponseEntity.ok(new PostDto(post, comments, user));
    }




    @GetMapping("/{id}")
    public ResponseEntity<?> getPost(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElse(null);

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);

        List<Comment> comments = commentRepo.findByPostId(post.getId());
        PostDto dto = new PostDto(post, comments, user);

        return ResponseEntity.ok(dto);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePost(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        Post post = postRepo.findById(id).orElse(null);
        if (post == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Post not found");
        }

        if (!post.getAuthor().getId().equals(user.getId()) && !Boolean.TRUE.equals(user.getIsElderOwl())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You cannot delete this post");
        }

        List<String> images = new ArrayList<>();
        for (ImagePost ip : post.getImagePosts()) {
            images.add(ip.getUrl());
        }

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
    public ResponseEntity<?> getPosts(
            @RequestParam(required = false) Long communityId,
            @RequestParam(defaultValue = "hot") String sort,
            @RequestParam(defaultValue = "week") String time,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal User principal
    ) {
        User u = userService.getCurrentUser(principal).orElse(null);

        LocalDateTime now = LocalDateTime.now();

        // default "all time" = veľmi starý dátum (nikdy null)
        LocalDateTime from = LocalDateTime.of(1970, 1, 1, 0, 0);

        String t = (time == null) ? "week" : time.toLowerCase();
        if ("day".equals(t)) {
            from = now.minusDays(1);
        } else if ("week".equals(t)) {
            from = now.minusDays(7);
        } else if ("month".equals(t)) {
            from = now.minusDays(30);
        } else if ("year".equals(t)) {
            from = now.minusDays(365);
        } else if ("all".equals(t)) {
            from = LocalDateTime.of(1970, 1, 1, 0, 0);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time: " + time);
        }

        Pageable pageableNew = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Pageable pageable = PageRequest.of(page, size);

        Page<Post> postsPage;

        switch (sort.toLowerCase()) {
            case "new": {
                if (communityId == null) postsPage = postRepo.findNewSince(from, pageableNew);
                else postsPage = postRepo.findNewByCommunitySince(communityId, from, pageableNew);
                break;
            }

            case "best": {
                if (communityId == null) postsPage = postRepo.findBestSince(from, pageable);
                else postsPage = postRepo.findBestByCommunitySince(communityId, from, pageable);
                break;
            }

            case "hot": {
                // HOT = BEST v časovom okne
                // ak user dá all, nastav hot default na week (inak hot==best all time)
                LocalDateTime hotFrom = from;
                if ("all".equals(t)) hotFrom = now.minusDays(7);

                if (communityId == null) postsPage = postRepo.findBestSince(hotFrom, pageable);
                else postsPage = postRepo.findBestByCommunitySince(communityId, hotFrom, pageable);
                break;
            }

            default:
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort: " + sort);
        }

        List<PostDto> dtos = new ArrayList<>(postsPage.getContent().size());
        for (int i = 0; i < postsPage.getContent().size(); i++) {
            dtos.add(new PostDto(postsPage.getContent().get(i), null, u));
        }

        return ResponseEntity.ok(dtos);
    }








}
