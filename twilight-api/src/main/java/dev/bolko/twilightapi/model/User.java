package dev.bolko.twilightapi.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.*;

import java.util.*;

@Entity
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "users")
public final class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;
    private String description;
    private String image;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Post> posts = new ArrayList<>();

    @OneToMany(mappedBy = "creator", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Community> createdCommunities = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "user_community", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "community_id"))
    private Set<Community> communities = new HashSet<>();

    @ManyToMany(mappedBy = "likes")
    @JsonIgnore
    private Set<Post> likedPosts = new HashSet<>();
}
