package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Post;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    @NonNull
    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    Optional<Post> findById(Long id);

    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    Page<Post> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    Page<Post> findByCommunityId(Long communityId, Pageable pageable);

    long countByCommunityId(Long communityId);


    // NEW (bez community)
    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    @Query("""
        select p from Post p
        where p.deletedAt is null
          and p.createdAt >= :from
        order by p.createdAt desc
    """)
    Page<Post> findNewSince(@Param("from") LocalDateTime from, Pageable pageable);

    // NEW (v komunite)
    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    @Query("""
        select p from Post p
        where p.deletedAt is null
          and p.community.id = :communityId
          and p.createdAt >= :from
        order by p.createdAt desc
    """)
    Page<Post> findNewByCommunitySince(@Param("communityId") Long communityId,
                                       @Param("from") LocalDateTime from,
                                       Pageable pageable);

    // BEST (bez community) - žiadny GROUP BY, len size()
    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    @Query("""
        select p from Post p
        where p.deletedAt is null
          and p.createdAt >= :from
        order by size(p.likes) desc, p.createdAt desc
    """)
    Page<Post> findBestSince(@Param("from") LocalDateTime from, Pageable pageable);

    // BEST (v komunite)
    @EntityGraph(attributePaths = {"author", "likes", "imagePosts", "community"})
    @Query("""
        select p from Post p
        where p.deletedAt is null
          and p.community.id = :communityId
          and p.createdAt >= :from
        order by size(p.likes) desc, p.createdAt desc
    """)
    Page<Post> findBestByCommunitySince(@Param("communityId") Long communityId,
                                        @Param("from") LocalDateTime from,
                                        Pageable pageable);
}