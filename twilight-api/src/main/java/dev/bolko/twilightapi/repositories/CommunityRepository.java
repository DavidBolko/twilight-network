package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Community;
import org.hibernate.Hibernate;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityRepository extends JpaRepository<Community,  Long >{
    Optional<Community> findByName(String name);

    List<Community> findByNameContainingIgnoreCase(String query);

    @EntityGraph(attributePaths = {"members"})
    Optional<Community> findWithMembersById(Long id);

    @Query("select c from Community c where c.creator.id = :userId")
    List<Community> findOwnedByUser(@Param("userId") UUID userId);

    @Query("select distinct c from Community c join c.members m where m.id = :userId")
    List<Community> findMemberByUser(@Param("userId") UUID  userId);
}
