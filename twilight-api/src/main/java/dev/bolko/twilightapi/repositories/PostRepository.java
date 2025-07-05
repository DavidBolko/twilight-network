package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long>{
}
