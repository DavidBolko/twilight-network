package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.*;
import dev.bolko.twilightapi.utils.PostType;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final InputValidatorService validator;
    private final CommunityRepository communityRepo;
    private final PostRepository postRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final ImageService imageService;

    @Transactional
    public PostDto create(Long communityId, String text, List<MultipartFile> images, User me) {
        Community community = communityRepo.findById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Community not found"));

        String err = validator.validatePostInput(text, images);
        if (err != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, err);

        boolean hasText = text != null && !text.trim().isEmpty();
        boolean hasImages = images != null && !images.isEmpty();

        Post post = new Post();
        post.setCommunity(community);
        post.setAuthor(me);
        post.setText(hasText ? text.trim() : null);
        post.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

        if (hasImages) {
            try {
                post.getImagePosts().addAll(imageService.saveImages(images, post));
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
            }
        }

        postRepo.save(post);
        return new PostDto(post, List.of(), me);
    }

    @Transactional
    public PostDto update(Long id, String text, List<MultipartFile> images, List<String> removeImageIds, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean canEdit = post.getAuthor().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!canEdit) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot edit this post");

        if (text != null) {
            String t = text.trim();
            post.setText(t.isEmpty() ? null : t);
        }

        if (removeImageIds != null && !removeImageIds.isEmpty()) {
            Set<String> remove = new HashSet<>(removeImageIds);
            List<String> toDelete = new ArrayList<>();

            Iterator<ImagePost> it = post.getImagePosts().iterator();
            while (it.hasNext()) {
                ImagePost ip = it.next();
                if (remove.contains(ip.getUrl())) {
                    toDelete.add(ip.getUrl());
                    it.remove();
                }
            }
            if (!toDelete.isEmpty()) imageService.deleteImages(toDelete);
        }

        int current = post.getImagePosts() == null ? 0 : post.getImagePosts().size();
        int add = images == null ? 0 : images.size();
        if (current + add > 10) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can upload a maximum of 10 images.");

        if (images != null && !images.isEmpty()) {
            String imgErr = validator.validatePostInput(null, images);
            if (imgErr != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, imgErr);
        }

        if (images != null && !images.isEmpty()) {
            try {
                post.getImagePosts().addAll(imageService.saveImages(images, post));
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
            }
        }

        boolean hasTextNow = post.getText() != null && !post.getText().trim().isEmpty();
        boolean hasImagesNow = post.getImagePosts() != null && !post.getImagePosts().isEmpty();

        String finalErr = validator.validatePostInput(post.getText(), hasImagesNow);
        if (finalErr != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, finalErr);

        post.setType(hasTextNow && hasImagesNow ? PostType.MIXED : hasImagesNow ? PostType.IMAGE : PostType.TEXT);

        List<Comment> comments = commentRepo.findByPostId(post.getId());
        return new PostDto(post, comments, me);
    }

    @Transactional(readOnly = true)
    public PostDto getOne(Long id, User meOrNull) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        List<Comment> comments = commentRepo.findByPostId(post.getId());
        return new PostDto(post, comments.reversed(), meOrNull);
    }

    @Transactional
    public void delete(Long id, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean canDelete = post.getAuthor().getId().equals(me.getId()) || me.getIsElderOwl();
        if (!canDelete) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this post");

        List<String> urls = post.getImagePosts().stream().map(ImagePost::getUrl).toList();
        imageService.deleteImages(urls);

        postRepo.delete(post);
    }

    @Transactional
    public void toggleLike(Long id, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!post.getLikes().add(me)) post.getLikes().remove(me);
    }

    @Transactional
    public void toggleSave(Long id, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Set<Post> saved = me.getSavedPosts();
        if (!saved.add(post)) saved.remove(post);

        userRepo.save(me);
    }

    @Transactional
    public String addComment(Long postId, String content, User me) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String c = content == null ? "" : content.trim();
        if (c.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        if (c.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment too long (max 500)");

        Comment com = new Comment(c, post, me);
        commentRepo.save(com);
        return com.getContent();
    }

    @Transactional
    public Comment updateComment(Long postId, Long commentId, String text, User me) {
        Comment c = commentRepo.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!c.getPost().getId().equals(postId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        boolean can = c.getAuthor().getId().equals(me.getId()) || me.getIsElderOwl();
        if (!can) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        String t = text == null ? "" : text.trim();
        if (t.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment required");
        if (t.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too long");

        c.setContent(t);
        return c;
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, User me) {
        Comment c = commentRepo.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        if (!c.getPost().getId().equals(postId)) throw new ResponseStatusException(HttpStatus.NOT_FOUND);

        boolean can = c.getAuthor().getId().equals(me.getId()) || me.getIsElderOwl();
        if (!can) throw new ResponseStatusException(HttpStatus.FORBIDDEN);

        commentRepo.delete(c);
    }

    @Transactional(readOnly = true)
    public List<PostDto> feed(Long communityId, String sort, String time, int page, int size, User meOrNull) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime from;

        String t = (time == null ? "week" : time.toLowerCase());
        if ("day".equals(t)) from = now.minusDays(1);
        else if ("week".equals(t)) from = now.minusDays(7);
        else if ("month".equals(t)) from = now.minusDays(30);
        else if ("year".equals(t)) from = now.minusDays(365);
        else if ("all".equals(t)) from = LocalDateTime.of(1970, 1, 1, 0, 0);
        else throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time: " + time);

        String s = (sort == null ? "hot" : sort.toLowerCase());
        if ("hot".equals(s) && "all".equals(t)) from = now.minusDays(7);

        Page<Post> postsPage;

        if ("new".equals(s)) {
            Pageable pageableNew = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
            postsPage = (communityId == null) ? postRepo.findNewSince(from, pageableNew) : postRepo.findNewByCommunitySince(communityId, from, pageableNew);

        } else if ("best".equals(s) || "hot".equals(s)) {
            Pageable pageable = PageRequest.of(page, size);
            postsPage = (communityId == null) ? postRepo.findBestSince(from, pageable) : postRepo.findBestByCommunitySince(communityId, from, pageable);

        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid sort: " + sort);
        }

        return postsPage.getContent().stream().map(p -> new PostDto(p, null, meOrNull)).toList();
    }
}
