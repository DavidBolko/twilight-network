package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.ImagePost;
import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.ImagePostRepository;
import dev.bolko.twilightapi.repositories.PostRepository;
import dev.bolko.twilightapi.services.UploadService;
import dev.bolko.twilightapi.utils.PostType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/p")
@RequiredArgsConstructor
public class PostController {

    private final CommunityRepository communityRepo;
    private final PostRepository postRepo;
    private final ImagePostRepository imagePostRepo;
    private final UploadService uploadService;
    private static final Logger logger = LoggerFactory.getLogger(PostController.class);

    @PostMapping(value = "/{communityId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createPost(@PathVariable("communityId") Long communityId, @RequestParam("title") String title, @RequestParam("type") String type, @RequestParam("text") String text, @RequestParam(value = "images") MultipartFile[] images) {
        Optional<Community> com = communityRepo.findById(communityId);
        if(com.isEmpty()){
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Community not find");
        }

        Post post = null;

        if(images != null && images.length > 0){
            try {
                for (MultipartFile image : images) {
                    logger.info("Name: {}", image.getOriginalFilename());
                    logger.info("Size: {}", image.getSize());

                    post = new Post(title, text, com.get());
                    post.setType(PostType.IMAGE);
                    postRepo.save(post);

                    String id = uploadService.uploadImage(image);
                    imagePostRepo.save(new ImagePost(id, post));
                }
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Image upload failed: " + e.getMessage());
            }
        }
        else{
            post = new Post(title, text, com.get());
            post.setType(PostType.TEXT);
            postRepo.save(post);
        }

        return ResponseEntity.ok(post);
    }

    /*
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPost(@PathVariable("id") Long id) {
        Post post = postRepo.findById(id).orElse(null);

        if(post == null){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Community community = communityRepo.findById(post.getCommunity().getId()).orElse(null);

    }

*/
}
