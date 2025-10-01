package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.User;

import java.util.UUID;

public class AuthDto {
    public UUID id;
    public String name;
    public String image;

    public AuthDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.image = user.getImage();
    }
}
