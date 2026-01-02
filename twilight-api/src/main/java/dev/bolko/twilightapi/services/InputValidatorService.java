package dev.bolko.twilightapi.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class InputValidatorService {
    public String validateRegistrationInput(String name, String email, String password, String password2) {
        String err;
        if ((err = validateName(name)) != null) return err;
        if ((err = validateEmail(email)) != null) return err;
        if ((err = validatePassword(password)) != null) return err;
        if (password == null || !password.equals(password2)) return "Passwords do not match.";
        return null;
    }

    public String validateLoginInput(String email, String password) {
        String err;
        if ((err = validateEmail(email)) != null) return err;
        if ((err = validatePassword(password)) != null) return err;
        return null;
    }

    public String validateCommunityInput(String name, String description, MultipartFile image) {
        String err;
        if ((err = validateName(name)) != null) return err;

        if (isBlank(description)) return "Description cannot be empty.";
        if (description.length() < 10 || description.length() > 300)
            return "Description must be between 10 and 300 characters.";
        if (containsHtml(description)) return "Description cannot contain HTML tags.";

        if ((err = validateImage(image, 25)) != null) return err;
        return null;
    }

    public String validatePostInput(String text, List<MultipartFile> images) {
        String err;

        boolean hasText = !isBlank(text);
        boolean hasImages = images != null && !images.isEmpty();

        if (!hasText && !hasImages)
            return "Post cannot be empty.";

        if (text != null && text.length() > 2000)
            return "Post text is too long. Max 2000 characters.";
        if (containsHtml(text))
            return "Post text cannot contain HTML tags.";

        if (hasImages) {
            if (images.size() > 10)
                return "You can upload a maximum of 10 images.";
            for (MultipartFile file : images) {
                if ((err = validateImage(file, 5)) != null) return err;
            }
        }

        return null;
    }

    private String validateName(String name) {
        if (isBlank(name)) return "Name cannot be empty.";
        if (name.length() < 3 || name.length() > 30)
            return "Name must be between 3 and 30 characters.";
        if (!name.matches("^[A-Za-z0-9 _-]+$"))
            return "Name contains invalid characters.";
        return null;
    }

    private String validateTitle(String title) {
        if (isBlank(title)) return "Title cannot be empty.";
        if (title.length() < 3 || title.length() > 100)
            return "Title must be between 3 and 100 characters.";
        return null;
    }

    private String validateEmail(String email) {
        if (isBlank(email)) return "Email cannot be empty.";
        if (!email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$"))
            return "Invalid email format.";
        return null;
    }

    private String validatePassword(String password) {
        if (isBlank(password)) return "Password cannot be empty.";
        if (password.length() < 6)
            return "Password must be at least 6 characters long.";
        if (!password.matches(".*[A-Z].*"))
            return "Password must contain at least one uppercase letter.";
        if (!password.matches(".*[0-9].*"))
            return "Password must contain at least one number.";
        return null;
    }

    private String validateImage(MultipartFile file, int maxSizeMB) {
        if (file == null || file.isEmpty()) return null;
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/"))
            return "Invalid image format. Only image files are allowed.";
        if (file.getSize() > (long) maxSizeMB * 1024 * 1024)
            return "Image size exceeds " + maxSizeMB + " MB.";
        return null;
    }

    private boolean containsHtml(String text) {
        return text != null && text.matches(".*<[^>]+>.*");
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }
}
