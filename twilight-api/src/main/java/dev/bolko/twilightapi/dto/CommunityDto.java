package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;

import java.util.List;

public record CommunityDto(
        Long id,
        String name,
        String description,
        String imageUrl
) {}