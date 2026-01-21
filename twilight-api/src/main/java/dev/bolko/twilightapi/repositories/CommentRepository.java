package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>{
    List<Comment> findByPostIdOrderByIdAsc(Long postId);

    void deleteCommentsByPost_Id(Long postId);
}
