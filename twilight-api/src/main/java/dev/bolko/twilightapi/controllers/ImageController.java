package dev.bolko.twilightapi.controllers;


import dev.bolko.twilightapi.services.ImageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.MediaTypeFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/i")
@RequiredArgsConstructor
public class ImageController {

    private final ImageService imageService;

    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) {
        try {
            Resource file = imageService.loadImage(filename);
            MediaType mediaType = MediaTypeFactory.getMediaType(file).orElse(MediaType.APPLICATION_OCTET_STREAM);
            return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"").contentType(mediaType).body(file);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
