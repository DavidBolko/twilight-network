package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{

    @NonNull
    @EntityGraph(attributePaths = {"likes", "imagePosts", "community"})
    Optional<Post> findById(Long id);

}
