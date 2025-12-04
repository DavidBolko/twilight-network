package dev.bolko.twilightapi.dto;

import java.util.UUID;

public record UserSearchDto(
        UUID id,
        String name,
        String image
) {}