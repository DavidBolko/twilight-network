package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.ImagePost;
import dev.bolko.twilightapi.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagePostRepository extends JpaRepository<ImagePost, Long>{
    @Query("SELECT i.url FROM ImagePost i WHERE i.post.id = :postId")
    List<String> findUrlsByPostId(Long postId);
}
