package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>{
    User findUserByEmail(String email);
    Page<User> findAll(Pageable pageable);
    List<User> findByNameContainingIgnoreCase(String name);

    @Query("""
  select cast(u.id as string)
  from Community c
  join c.nightOwls u
  where c.id = :communityId
""")
    List<String> findNightOwlIdsByCommunityId(@Param("communityId") Long communityId);


    Optional<User> findByEmail(String email);
}
