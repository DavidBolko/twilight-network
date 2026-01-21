package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.utils.PostType;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class PostDto {
    public Long id;
    public String text;
    public PostType type;

    public Long communityId;
    public String communityName;
    public String communityImage;

    public AuthDto author;
    public List<String> images;
    public List<AuthDto> likes;
    public boolean saved;

    public LocalDateTime createdAt;
    public List<String> communityNightOwlsId;

    public PostDto(Post post, User user) {
        this.id = post.getId();
        this.text = post.getText();
        this.type = post.getType();
        this.createdAt = post.getCreatedAt();

        this.author = new AuthDto(post.getAuthor());
        this.communityId = post.getCommunity() != null ? post.getCommunity().getId() : null;
        this.communityName = post.getCommunity() != null ? post.getCommunity().getName() : null;
        this.communityImage = post.getCommunity() != null ? post.getCommunity().getImage() : null;

        this.saved = user != null && user.getSavedPosts().stream().anyMatch(p -> p.getId().equals(post.getId()));

        this.images = post.getImagePosts() == null ? List.of() : post.getImagePosts().stream().map(ImagePost::getUrl).toList();
        this.likes = post.getLikes() == null ? List.of() : post.getLikes().stream().map(AuthDto::new).toList();

        this.communityNightOwlsId = List.of();
    }

    public PostDto(Post post, User user, List<String> owlIds) {
        this(post, user);
        this.communityNightOwlsId = (owlIds == null) ? List.of() : owlIds;
    }

    public PostDto(Post post) {
        this(post, null);
    }
}

