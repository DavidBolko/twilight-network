package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long>{
    List<Comment> findByPostId(Long postId);
}
