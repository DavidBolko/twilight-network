package dev.bolko.twilightapi.repositories;

import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>{
}
