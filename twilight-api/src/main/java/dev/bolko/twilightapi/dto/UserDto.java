package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

public class UserDto {
    public UUID id;
    public String name;
    public String image;
    public String description;

    public List<PostDto> posts;
    public Set<CommunityDto> communities;
    public Set<PostDto> saved;
    public boolean isElder;

    public UserDto(User user, List<Comment> allComments) {
        this.id = user.getId();
        this.name = user.getName();
        this.image = user.getImage();
        this.description = user.getDescription();
        this.saved = user.getSavedPosts().stream().map(PostDto::new).collect(Collectors.toSet());
        this.isElder = user.getIsElderOwl();

        this.posts = user.getPosts() == null
                ? List.of()
                : user.getPosts().stream()
                .map(post -> {
                    List<Comment> commentsForPost = allComments.stream()
                            .filter(c -> c.getPost().getId().equals(post.getId()))
                            .toList();
                    return new PostDto(post, commentsForPost, user);
                })
                .toList();

        this.communities = user.getCommunities() == null
                ? Set.of()
                : user.getCommunities().stream()
                .map(c -> new CommunityDto(c, allComments, user))
                .collect(Collectors.toSet());
    }

    public UserDto(User user) {
        this(user, List.of());
    }
}
