package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CommunityDto;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.attribute.UserPrincipal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final UploadService uploadService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createCommunity(@RequestParam("name") String name, @RequestParam("image") MultipartFile image, Authentication auth) {
        if(communityRepo.findByName(name).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Name already exists");
        }

        if (auth == null || !(auth.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String imageFilename = "";
        try {
            imageFilename = uploadService.uploadImage(image);
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }

        User creator = userRepo.findById(((User) auth.getPrincipal()).getId()).orElseThrow(() -> new RuntimeException("User not found"));

        Community c = new Community();
        c.setName(name);
        c.setImage(imageFilename);
        c.setCreator(creator);

        return ResponseEntity.status(HttpStatus.CREATED).body(communityRepo.save(c));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommunityDto> getCommunity(@PathVariable("id") Long id) {
        return communityRepo.findById(id).map(original -> {
            String presignedUrl = null;
            try {
                presignedUrl = uploadService.getFile(original.getImage());
            } catch (IOException e) {
                throw new RuntimeException("Failed to generate image URL", e);
            }

            CommunityDto response = new CommunityDto(original.getId(), original.getName(), original.getDescription(), presignedUrl);

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<CommunityDto>> searchByName(@RequestParam String query) {
        List<Community> communities = communityRepo.findByNameContainingIgnoreCase(query);

        if(communities.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        List<CommunityDto> result = communities.stream().map(community -> {
            String presignedUrl = null;
            try {
                presignedUrl = uploadService.getFile(community.getImage());
            } catch (IOException e) {
                throw new RuntimeException("Failed to generate image URL", e);
            }
            return new CommunityDto(community.getId(), community.getName(), community.getDescription(), presignedUrl);
        }).toList();

        return ResponseEntity.ok(result);
    }
}
