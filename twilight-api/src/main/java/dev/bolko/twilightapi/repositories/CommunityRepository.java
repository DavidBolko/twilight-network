package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Community;
import org.hibernate.Hibernate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CommunityRepository extends JpaRepository<Community, Long>{
    Optional<Community> findByName(String name);

    List<Community> findByNameContainingIgnoreCase(String query);
}
