package dev.bolko.twilightapi.model;

import dev.bolko.twilightapi.utils.FriendshipStatus;
import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;


@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "friendships")
public class Friendship {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    private User requester;

    @ManyToOne(optional = false)
    private User addressee;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FriendshipStatus status;
}
