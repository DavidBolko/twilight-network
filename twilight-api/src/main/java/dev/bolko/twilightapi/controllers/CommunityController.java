package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.services.UploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/c")
@RequiredArgsConstructor
public class CommunityController {

    private final CommunityRepository communityRepo;
    private final UploadService uploadService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createCommunity(@RequestParam("name") String name, @RequestParam("image") MultipartFile image) {
        if(communityRepo.findByName(name).isPresent()){
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Name already exists");
        }

        String imageFilename = "";
        try {
            imageFilename = uploadService.uploadImage(image);
        } catch (IOException e) {
            System.out.println(e.getMessage());
        }

        Community c = new Community();
        c.setName(name);
        c.setImage(imageFilename);

        return ResponseEntity.status(HttpStatus.CREATED).body(communityRepo.save(c));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Community> getCommunity(@PathVariable("id") Long id) {
        return communityRepo.findById(id).map(original -> {
            String presignedUrl = null;
            try {
                presignedUrl = uploadService.getFile(original.getImage());
            } catch (IOException e) {
                throw new RuntimeException(e);
            }

            Community response = new Community(original.getId(), original.getName(), original.getImage(), presignedUrl, new ArrayList<>());

            return ResponseEntity.ok(response);
        }).orElse(ResponseEntity.notFound().build());
    }
}
