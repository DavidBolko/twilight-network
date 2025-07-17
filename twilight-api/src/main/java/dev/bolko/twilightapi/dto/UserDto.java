package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.model.User;

import java.util.List;
import java.util.UUID;

public class UserDto {
    public UUID id;
    public String name;
    public String image;

    public UserDto(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.image = user.getImage();
    }
}