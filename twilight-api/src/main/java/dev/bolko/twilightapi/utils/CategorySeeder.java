package dev.bolko.twilightapi.utils;

import dev.bolko.twilightapi.model.Category;
import dev.bolko.twilightapi.repositories.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class CategorySeeder {

    private final CategoryRepository categoryRepo;

    @Bean
    ApplicationRunner seedCategories() {
        return args -> seed();
    }

    @Transactional
    void seed() {
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
