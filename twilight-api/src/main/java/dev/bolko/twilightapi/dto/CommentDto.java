package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.model.User;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

public class CommentDto {
    public Long id;
    public String content;
    public UserDto author;
    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.content =  comment.getContent();
        this.author = new UserDto(comment.getAuthor());

    }
}