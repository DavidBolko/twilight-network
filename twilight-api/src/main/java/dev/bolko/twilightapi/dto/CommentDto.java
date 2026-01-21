package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;

import java.util.List;

public class CommentDto {
    public Long id;
    public String text;
    public AuthDto author;
    public List<String> communityNightOwlsId;
    public Long postId;

    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getContent();
        this.author = new AuthDto(comment.getAuthor());
        this.postId = comment.getPost() != null ? comment.getPost().getId() : null;
    }
}

