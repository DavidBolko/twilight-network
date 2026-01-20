package dev.bolko.twilightapi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
public final class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    @Column(length = 500)
    private String description;

    private String image;

    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    @OrderBy("createdAt DESC")
    private List<Post> posts = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id", nullable = false)
    @JsonBackReference
    private User creator;

    @ManyToMany(mappedBy = "communities")
    @JsonIgnore
    private Set<User> members = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    public Community(String name, String description, String image, User creator) {
        this.name = name;
        this.description = description;
        this.image = image;
        this.creator = creator;
    }
    // --- helpers (používaj v service) ---
    public void addMember(User user) {
        members.add(user);
        user.getCommunities().add(this);
    }

    public void removeMember(User user) {
        members.remove(user);
        user.getCommunities().remove(this);
    }
}
