package dev.bolko.twilightapi.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public final class ImagePost {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false)
    private String url;

    private Integer position;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @JsonBackReference
    private Post post;

    public ImagePost(String url, Post post, Integer position) {
        this.url = url;
        this.post = post;
        this.position = position;
    }

    public ImagePost(String url, Post post) {
        this(url, post, null);
    }
}
