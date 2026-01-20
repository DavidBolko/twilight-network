package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.dto.CategoryDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepo;

    @Transactional(readOnly = true)
    public List<CategoryDto> getAll() {
        return categoryRepo.findAll().stream().map(CategoryDto::new).toList();
    }
}