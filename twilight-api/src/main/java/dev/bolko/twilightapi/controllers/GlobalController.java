package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunitySearchDto;
import dev.bolko.twilightapi.dto.SearchResponseDto;
import dev.bolko.twilightapi.dto.UserSearchDto;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class GlobalController {

    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;

    @GetMapping("/search")
    public ResponseEntity<SearchResponseDto> search(@RequestParam String query) {
        var communities = communityRepo.findByNameContainingIgnoreCase(query)
                .stream()
                .map(c -> new CommunitySearchDto(c.getId(), c.getName(), c.getImage()))
                .collect(Collectors.toList());

        var users = userRepo.findByNameContainingIgnoreCase(query)
                .stream()
                .map(u -> new UserSearchDto(u.getId(), u.getName(), u.getImage()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(new SearchResponseDto(communities, users));
    }
}