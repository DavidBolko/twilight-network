package dev.bolko.twilightapi.utils;

import dev.bolko.twilightapi.model.Category;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CategoryRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
public class Seeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final CategoryRepository categoryRepo;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedElder();
        seedCategories();
    }

    private void seedElder() {
        String email = "elder@example.com";
        if (userRepo.findByEmail(email).isPresent()) return;

        User elder = new User();
        elder.setName("Elder Demo");
        elder.setEmail(email);
        elder.setDescription("Demo elder admin user");
        elder.setIsElderOwl(true);
        elder.setPassword(passwordEncoder.encode("Admin123"));
        elder.setImage(null);
        userRepo.save(elder);
    }

    private void seedCategories() {
        List<String> defaults = List.of("Technology", "Gaming", "Music", "Movies", "Sports", "Travel", "Food", "Art", "School", "Memes");

        for (String name : defaults) {
            if (!categoryRepo.existsByNameIgnoreCase(name)) {
                Category c = new Category();
                c.setName(name);
                categoryRepo.save(c);
            }
        }
    }
}
