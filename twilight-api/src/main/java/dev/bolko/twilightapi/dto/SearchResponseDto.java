package dev.bolko.twilightapi.dto;

import java.util.List;
import java.util.UUID;

public record SearchResponseDto(
        List<CommunitySearchDto> communities,
        List<UserSearchDto> users
) {}