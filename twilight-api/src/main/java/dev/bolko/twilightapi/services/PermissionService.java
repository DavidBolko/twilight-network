package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PermissionService {
    private final UserRepository userRepo;

    public boolean canModerate(UUID authorId, Long communityId, User me) {
        if (authorId.equals(me.getId())) return true;
        if (Boolean.TRUE.equals(me.getIsElderOwl())) return true;

        List<String> owlIds = userRepo.findNightOwlIdsByCommunityId(communityId);
        return owlIds.contains(me.getId().toString());
    }
}