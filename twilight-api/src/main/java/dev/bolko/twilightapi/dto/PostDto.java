package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.model.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class PostDto {
    public Long id;
    public String title;
    public String text;
    public Community community;
    public UserDto author;
    public List<String> images;
    public List<UserDto> likes;
    public List<CommentDto> comments;
    public PostDto(Post post, List<String> imagesUrl, List<Comment> comments) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.text = post.getText();
        this.author = new UserDto(post.getAuthor());
        this.community = post.getCommunity();
        this.images = imagesUrl;
        this.likes = post.getLikes() == null
                ? List.of()
                : post.getLikes().stream().map(UserDto::new).toList();

        this.comments = comments == null
                ? List.of()
                : comments.stream().map(CommentDto::new).toList();
    }

    public PostDto(Post post) {
        this(post, List.of(), List.of());
    }
}