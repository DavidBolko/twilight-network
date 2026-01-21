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

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.image = user.getImage();
        this.description = user.getDescription();

        this.isElder = Boolean.TRUE.equals(user.getIsElderOwl());

        this.posts = (user.getPosts() == null) ? List.of() : user.getPosts().stream().map(p -> new PostDto(p, user)).toList();

        this.saved = (user.getSavedPosts() == null) ? Set.of() : user.getSavedPosts().stream().map(p -> new PostDto(p, user)).collect(Collectors.toSet());

        this.communities = (user.getCommunities() == null) ? Set.of() : user.getCommunities().stream().map(CommunityDto::new).collect(Collectors.toSet());
    }
}
