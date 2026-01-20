package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Category;

public record CategoryDto(Long id, String name) {
    public CategoryDto(Category c) {
        this(c.getId(), c.getName());
    }
}