package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Comment;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class CommunityDto {
    public Long id;
    public String name;
    public String description;
    public String imageUrl;
    public Set<AuthDto> members = new HashSet<>();
    public List<PostDto> posts;

    public CommunityDto(Community community, List<Comment> allComments) {
        this.id = community.getId();
        this.name = community.getName();
        this.description = community.getDescription();
        this.imageUrl = community.getImage();

        if (community.getMembers() != null) {
            this.members = community.getMembers().stream()
                    .map(AuthDto::new)
                    .collect(Collectors.toSet());
        }

        this.posts = community.getPosts().stream()
                .map(post -> {
                    List<Comment> commentsForPost = allComments.stream()
                            .filter(c -> c.getPost().getId().equals(post.getId()))
                            .toList();
                    return new PostDto(post, commentsForPost);
                })
                .toList();
    }

    public CommunityDto(Community community) {
        this(community, List.of());
    }
}
