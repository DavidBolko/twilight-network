package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.CategoryDto;
import dev.bolko.twilightapi.repositories.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDto>> getAll() {
        return ResponseEntity.ok(categoryService.getAll());
    }
}
