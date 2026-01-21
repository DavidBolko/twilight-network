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
    private final PermissionService perm;

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
        PostDto dto = new PostDto(post, me);
        dto.communityNightOwlsId = userRepo.findNightOwlIdsByCommunityId(post.getCommunity().getId());
        return dto;

    }

    @Transactional
    public PostDto update(Long id, String text, List<MultipartFile> images, List<String> removeImageIds, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        if (!perm.canModerate(post.getAuthor().getId(), post.getCommunity().getId(), me)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot edit this post");
        }

        if (text != null) {
            String t = text.trim();
            post.setText(t.isEmpty() ? null : t);
        }

        if (removeImageIds != null && !removeImageIds.isEmpty() && post.getImagePosts() != null) {
            Set<String> remove = new HashSet<>(removeImageIds);
            List<String> toDelete = post.getImagePosts().stream().map(ImagePost::getUrl).filter(remove::contains).toList();

            post.getImagePosts().removeIf(ip -> remove.contains(ip.getUrl()));

            if (!toDelete.isEmpty()) imageService.deleteImages(toDelete);
        }

        // 3) limit + add images
        int current = post.getImagePosts() == null ? 0 : post.getImagePosts().size();
        int add = (images == null) ? 0 : images.size();
        if (current + add > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can upload a maximum of 10 images.");
        }

        if (images != null && !images.isEmpty()) {
            String imgErr = validator.validatePostInput(null, images);
            if (imgErr != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, imgErr);

            try {
                post.getImagePosts().addAll(imageService.saveImages(images, post));
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Image upload failed");
            }
        }

        boolean hasImages = post.getImagePosts() != null && !post.getImagePosts().isEmpty();
        String finalErr = validator.validatePostInput(post.getText(), hasImages);
        if (finalErr != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, finalErr);

        boolean hasText = post.getText() != null && !post.getText().trim().isEmpty();
        post.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

        PostDto dto = new PostDto(post, me);
        dto.communityNightOwlsId = userRepo.findNightOwlIdsByCommunityId(post.getCommunity().getId());
        return dto;
    }


    @Transactional(readOnly = true)
    public PostDto getOne(Long id, User meOrNull) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        Long cId = post.getCommunity().getId();
        List<String> owlIds = userRepo.findNightOwlIdsByCommunityId(cId);
        long postCount = postRepo.countByCommunityId(cId);

        PostDto dto = new PostDto(post, meOrNull);
        dto.communityNightOwlsId = userRepo.findNightOwlIdsByCommunityId(post.getCommunity().getId());
        return dto;
    }

    @Transactional
    public void delete(Long id, User me) {
        Post post = postRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        boolean canDelete = perm.canModerate(post.getAuthor().getId(), post.getCommunity().getId(), me);
        if (!canDelete) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot delete this post");

        commentRepo.deleteCommentsByPost_Id(id);
        for (User u : post.getSavedBy()) {
            u.getSavedPosts().remove(post);
        }

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

        if (communityId != null) {
            List<String> owlIds = userRepo.findNightOwlIdsByCommunityId(communityId);

            return postsPage.getContent().stream().map(p -> {
                PostDto dto = new PostDto(p, meOrNull);
                dto.communityNightOwlsId = owlIds;
                return dto;
            }).toList();
        }

        return postsPage.getContent().stream().map(p -> {
            PostDto dto = new PostDto(p, meOrNull);
            dto.communityNightOwlsId = userRepo.findNightOwlIdsByCommunityId(p.getCommunity().getId());
            return dto;
        }).toList();
    }

}
