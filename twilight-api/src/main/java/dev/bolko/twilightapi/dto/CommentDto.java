package dev.bolko.twilightapi.dto;

import dev.bolko.twilightapi.model.Comment;

public class CommentDto {
    public Long id;
    public String text;
    public AuthDto author;
    public Long postId;

    public CommentDto(Comment comment) {
        this.id = comment.getId();
        this.text = comment.getContent();
        this.author = new AuthDto(comment.getAuthor());
        this.postId = comment.getPost() != null ? comment.getPost().getId() : null;
    }
}
