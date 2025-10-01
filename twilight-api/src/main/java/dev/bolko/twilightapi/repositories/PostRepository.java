package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;
import org.jetbrains.annotations.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

    @NotNull
    @EntityGraph(attributePaths = {"likes", "imagePosts", "community"})
    Optional<Post> findById(Long id);

    Page<Post> findByAuthorId(Long authorId, Pageable pageable);
}
