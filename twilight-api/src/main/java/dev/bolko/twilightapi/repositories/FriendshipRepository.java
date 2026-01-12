package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Friendship;
import dev.bolko.twilightapi.utils.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    Optional<Friendship> findByRequesterIdAndAddresseeId(UUID requesterId, UUID addresseeId);

    List<Friendship> findByStatusAndRequesterIdOrStatusAndAddresseeId(
            FriendshipStatus s1, UUID requesterId,
            FriendshipStatus s2, UUID addresseeId
    );
    List<Friendship> findByStatusAndAddresseeId(FriendshipStatus status, UUID addresseeId);

}