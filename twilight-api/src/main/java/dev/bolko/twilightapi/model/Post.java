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

    private String title;
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


    private LocalDateTime createdAt;
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public boolean isDeleted() {
        return deletedAt != null;
    }

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User author;

    @ManyToMany
    @JoinTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> likes = new HashSet<>();

    @PrePersist
    public void assignId() {
        if (this.id == null) {
            this.id = IdentifierGenerator.randomLong();
        }
        this.createdAt = LocalDateTime.now();
    }
    public Post(String title, String text, Community community) {
        this.title = title;
        this.text = text;
        this.community = community;
    }
}
