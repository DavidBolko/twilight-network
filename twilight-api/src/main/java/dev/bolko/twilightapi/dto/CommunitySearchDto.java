package dev.bolko.twilightapi.dto;

import java.util.UUID;

public record CommunitySearchDto(
        long id,
        String name,
        String imageUrl
) {}