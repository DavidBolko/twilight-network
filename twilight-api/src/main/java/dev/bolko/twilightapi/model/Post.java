package dev.bolko.twilightapi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import dev.bolko.twilightapi.utils.IdentifierGenerator;
import dev.bolko.twilightapi.utils.PostType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.*;

@Entity
@Data
@NoArgsConstructor
@SQLRestriction("deleted_at IS NULL")
public final class Post {

    @Id
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Enumerated(EnumType.STRING)
    private PostType type;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "community_id", nullable = false)
    @JsonIgnore
    private Community community;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<ImagePost> imagePosts = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("user-comments")
    private List<Comment> comments = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User author;

    @ManyToMany
    @JoinTable(
            name = "post_likes",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> likes = new HashSet<>();

    @PrePersist
    public void prePersist() {
        if (this.id == null) this.id = IdentifierGenerator.randomLong();
        this.createdAt = LocalDateTime.now();
        validateAndSyncType();
    }

    @PreUpdate
    public void preUpdate() {
        validateAndSyncType();
    }

    private void validateAndSyncType() {
        boolean hasText = text != null && !text.trim().isEmpty();
        boolean hasImages = imagePosts != null && !imagePosts.isEmpty();

        // Post musí mať aspoň text alebo obrázok
        if (!hasText && !hasImages) {
            throw new IllegalStateException("Post must contain text or at least one image.");
        }

        // Type si držíš konzistentný automaticky (FE nič neprepína)
        if (hasText && hasImages) this.type = PostType.MIXED;
        else if (hasImages) this.type = PostType.IMAGE;
        else this.type = PostType.TEXT;
    }

    public Post(String text, Community community, User author) {
        this.text = text;
        this.community = community;
        this.author = author;
    }
}
