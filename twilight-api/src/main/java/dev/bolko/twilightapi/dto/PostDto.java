package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.*;
import java.util.List;

public class PostDto {
    public Long id;
    public String title;
    public String text;
    public Long communityId;
    public String communityName;
    public String communityImage;
    public AuthDto author;
    public List<String> images;
    public List<AuthDto> likes;
    public List<CommentDto> comments;

    public PostDto(Post post, List<Comment> comments) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.text = post.getText();
        this.author = new AuthDto(post.getAuthor());
        this.communityId = post.getCommunity() != null ? post.getCommunity().getId() : null;
        this.communityName = post.getCommunity() != null ? post.getCommunity().getName() : null;
        this.communityImage = post.getCommunity() != null ? post.getCommunity().getImage() : null;

        this.images = post.getImagePosts() == null
                ? List.of()
                : post.getImagePosts().stream()
                .map(ImagePost::getUrl)
                .toList();

        this.likes = post.getLikes() == null
                ? List.of()
                : post.getLikes().stream()
                .map(AuthDto::new)
                .toList();

        this.comments = comments == null
                ? List.of()
                : comments.stream()
                .map(CommentDto::new)
                .toList();
    }

    public PostDto(Post post) {
        this(post, List.of());
    }
}
