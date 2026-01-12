package dev.bolko.twilightapi.dto;

import java.util.UUID;

public record FriendRequestDto(UUID id, String requesterName, String requesterImage) {}
