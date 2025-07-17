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
    public List<String> images;
    public List<UserDto> likes;
    public List<Comment> comments;
    public PostDto(Post post, List<String> imagesUrl, List<Comment> comments) {
        this.id = post.getId();
        this.title = post.getTitle();
        this.text = post.getText();
        this.community = post.getCommunity();
        this.images = imagesUrl;
        this.likes = new ArrayList<>();
        this.comments = comments;

        // Bezpečná iterácia
        for (User user : new HashSet<>(post.getLikes())) {
            this.likes.add(new UserDto(user));
        }
    }
}