package dev.bolko.twilightapi.services;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.errors.*;
import io.minio.http.Method;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Random;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UploadService {
    private final MinioClient minioClient;
    public String uploadImage(MultipartFile file) throws IOException {

        String fileName = file.getOriginalFilename();
        String extension = fileName != null ? fileName.substring(fileName.lastIndexOf(".")) : "";

        String newFileName = Math.abs(System.currentTimeMillis() * System.currentTimeMillis() * new Random().nextInt(1, 10)) + "." + extension;

        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket("twilight")
                    .object(newFileName)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
        } catch (Exception e) {
            throw new IOException("MinIO upload failed: " + e.getMessage(), e);
        }

        return newFileName;
    }

    public String getFile(String id) throws IOException {
        String url = null;
        try {
            url = minioClient.getPresignedObjectUrl(
                    GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket("twilight")
                            .object(id)
                            .expiry(60 * 60, TimeUnit.SECONDS) // 1 hodina
                            .build()
            );
        } catch (Exception e) {
            throw new IOException("MinIO couldnt be found: " + e.getMessage(), e);
        }

        return url;
    }
}
