package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunityDto;
import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.ImageService;
import dev.bolko.twilightapi.services.InputValidatorService;
import dev.bolko.twilightapi.services.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.*;


@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
public class CommunityController {
    private final InputValidatorService validator;
    private final ImageService imageService;
    private final UserService userService;
    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createCommunity(@RequestParam("name") String name, @RequestParam("description") String description, @RequestParam(value = "image", required = false) MultipartFile image, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        String validationError = validator.validateCommunityInput(name, description, image);
        if (validationError != null) {
            return ResponseEntity.badRequest().body(validationError);
        }

        if (communityRepo.findByName(name).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Name already exists");
        }

        String filename = null;
        if (image != null && !image.isEmpty()) {
            try {
                filename = imageService.saveImage(image);
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save community image");
            }
        } else {
            Random r = new Random();
            filename = "community" + r.nextInt(1,4) + ".png";
        }

        Community c = new Community(name, description, filename, user, new HashSet<>());
        c.addMember(user);
        Community saved = communityRepo.save(c);

        user.getCommunities().add(saved);
        userRepo.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new CommunityDto(saved));
    }


    @Transactional
    @GetMapping("/{id}")
    public ResponseEntity<CommunityDto> getCommunity(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        var user = userService.getCurrentUser(principal);
        return communityRepo.findById(id).map(com -> {
            List<Comment> allComments = commentRepo.findAll();
            Hibernate.initialize(com.getMembers());
            return ResponseEntity.ok(new CommunityDto(com, allComments, user.orElse(null)));
        }).orElse(ResponseEntity.notFound().build());
    }

    @Transactional
    @PutMapping("/join/{id}")
    public ResponseEntity<?> toggleCommunityMembership(@PathVariable("id") Long id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        if (user == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        Optional<Community> com = communityRepo.findById(id);
        if (com.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Community community = com.get();

        if (user.getCommunities().contains(community)) {
            user.getCommunities().remove(community);
            community.getMembers().remove(user);
        } else {
            user.getCommunities().add(community);
            community.getMembers().add(user);
        }

        userRepo.save(user);

        return ResponseEntity.ok().build();
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
