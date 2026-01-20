package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.Post;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final PostRepository postRepo;
    private final CommentRepository commentRepo;

    @Transactional
    public String addComment(Long postId, String content, User me) {
        Post post = postRepo.findById(postId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        String c = content == null ? "" : content.trim();
        if (c.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment cannot be empty");
        if (c.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment too long (max 500)");

        Comment com = new Comment(c, post, me);
        commentRepo.save(com);
        return com.getContent();
    }

    @Transactional
    public Comment updateComment(Long postId, Long commentId, String text, User me) {
        Comment c = commentRepo.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!c.getPost().getId().equals(postId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not in this post");

        boolean can = c.getAuthor().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!can) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");

        String t = text == null ? "" : text.trim();
        if (t.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Comment required");
        if (t.length() > 500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Too long");

        c.setContent(t);
        return c;
    }

    @Transactional
    public void deleteComment(Long postId, Long commentId, User me) {
        Comment c = commentRepo.findById(commentId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));

        if (!c.getPost().getId().equals(postId))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not in this post");

        boolean can = c.getAuthor().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!can) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");

        commentRepo.delete(c);
    }
}