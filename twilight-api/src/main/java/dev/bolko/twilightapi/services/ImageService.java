package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.model.ImagePost;
import dev.bolko.twilightapi.model.Post;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.net.MalformedURLException;
@Service
public class ImageService {
    private static final String UPLOAD_DIR = "uploads/";

    public ImageService() {
        File uploadDir = new File(UPLOAD_DIR);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created) {
                throw new RuntimeException("Could not create upload directory");
            }
        }
    }

    public String saveImage(MultipartFile image) throws IOException {
        String uniqueName = System.currentTimeMillis() + "" + (int)(Math.random() * 10000) + ".jpeg";
        String filePath = UPLOAD_DIR + uniqueName;
        File destinationFile = new File(filePath);
        Thumbnails.of(image.getInputStream()).scale(1.0).outputQuality(0.6).outputFormat("jpeg").toFile(destinationFile);

        return uniqueName;
    }

    public Collection<ImagePost> saveImages(List<MultipartFile> images, Post post) throws IOException {
        List<ImagePost> imagePosts = new ArrayList<>();

        for (MultipartFile image : images) {
            String uniqueName = java.util.UUID.randomUUID().toString().replace("-", "") + ".jpeg";
            String filePath = UPLOAD_DIR + uniqueName;
            File destinationFile = new File(filePath);

            Thumbnails.of(image.getInputStream()).scale(1.0).outputQuality(0.6).outputFormat("jpeg").toFile(destinationFile);

            imagePosts.add(new ImagePost(uniqueName, post));
        }

        return imagePosts;
    }

    public void deleteImages(List<String> imageKeys) {
        for (String imageKey : imageKeys) {
            File file = new File(UPLOAD_DIR + imageKey);
            if (file.exists()) {
                boolean deleted = file.delete();
                if (!deleted) {
                    System.err.println("Could not delete file: " + file.getAbsolutePath());
                }
            }
        }
    }

    public Resource loadImage(String filename) throws MalformedURLException {
        Path filePath = Paths.get(UPLOAD_DIR).resolve(filename).normalize();
        Resource resource = new UrlResource(filePath.toUri());

        if (resource.exists() && resource.isReadable()) {
            return resource;
        } else {
            throw new RuntimeException("Could not read file: " + filename);
        }
    }

}
