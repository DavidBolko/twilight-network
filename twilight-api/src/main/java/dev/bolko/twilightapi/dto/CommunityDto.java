package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Community;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class CommunityDto {
    public Long id;
    public String name;
    public String description;
    public String imageUrl;
    public Set<AuthDto> members = new HashSet<>();
    public long postCount;
    public String creatorId;

    public List<String> communityNightOwlsId;

    public CommunityDto(Community community, long postCount, List<String> owlIds) {
        this.id = community.getId();
        this.name = community.getName();
        this.description = community.getDescription();
        this.imageUrl = community.getImage();
        this.postCount = postCount;
        this.communityNightOwlsId = owlIds;
        this.creatorId = community.getCreator().getId().toString();

        if (community.getMembers() != null) {
            for (var m : community.getMembers()) {
                this.members.add(new AuthDto(m));
            }
        }
    }

    public CommunityDto(Community community) {
        this(community, 0, List.of());
    }
}