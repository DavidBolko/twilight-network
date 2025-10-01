package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.ImagePost;
import dev.bolko.twilightapi.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ImagePostRepository extends JpaRepository<ImagePost, Long>{
}
