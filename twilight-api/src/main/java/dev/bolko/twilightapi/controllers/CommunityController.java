package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunityDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createCommunity(@RequestParam("name") String name, @RequestParam("description") String description, @RequestParam("image") String imageKey, Authentication auth) {
        if (communityRepo.findByName(name).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Name already exists");
        }

        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User creator = userRepo.findById(((User) auth.getPrincipal()).getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<User> members = new HashSet<>();
        members.add(creator);

        Community c = new Community();
        c.setName(name);
        c.setDescription(description);
        c.setImage(imageKey);
        c.setCreator(creator);
        c.setMembers(members);

        Community saved = communityRepo.save(c);
        return ResponseEntity.status(HttpStatus.CREATED).body(new CommunityDto(saved));
    }


    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<CommunityDto> getCommunity(@PathVariable("id") Long id) {
        return communityRepo.findById(id)
                .map(com -> {
                    List<Comment> allComments = commentRepo.findAll();
                    return ResponseEntity.ok(new CommunityDto(com, allComments));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/join/{id}")
    public ResponseEntity<?> joinCommunity(@PathVariable("id") Long id, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User principal = (User) auth.getPrincipal();
        User user = userRepo.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return communityRepo.findById(id)
                .map(community -> {
                    user.getCommunities().add(community);
                    userRepo.save(user);
                    return ResponseEntity.ok("User joined community " + community.getName());
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/leave/{id}")
    public ResponseEntity<?> leaveCommunity(@PathVariable("id") Long id, Authentication auth) {
        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        User principal = (User) auth.getPrincipal();
        User user = userRepo.findById(principal.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return communityRepo.findById(id)
                .map(community -> {
                    user.getCommunities().remove(community);
                    userRepo.save(user);
                    return ResponseEntity.ok("User joined community " + community.getName());
                })
                .orElse(ResponseEntity.notFound().build());
    }


    @GetMapping
    public ResponseEntity<List<CommunityDto>> searchByName(@RequestParam String query) {
        List<Community> communities = communityRepo.findByNameContainingIgnoreCase(query);

        if (communities.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        List<CommunityDto> result = communities.stream().map(CommunityDto::new).toList();

        return ResponseEntity.ok(result);
    }

}
