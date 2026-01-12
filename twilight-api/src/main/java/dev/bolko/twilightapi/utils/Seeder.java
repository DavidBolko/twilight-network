package dev.bolko.twilightapi.utils;

import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.PostRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import jakarta.persistence.EntityManager;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;

@Profile("dev")
@Component
public class Seeder implements CommandLineRunner {
    private static final List<String> UPLOAD_IMAGES = Arrays.asList(
            "2b05ebdc1fbf44efa55b8226ea788fcd.jpeg",
            "9eaf6343e1104544b3d5db6d98081e67.jpeg",
            "51449b9f8f40477a99b161ade46bf5b2.jpeg",
            "109491ac88a249798a24d2880e73e5c9.jpeg",
            "22367507ffe94a16b7444d737f3c88dd.jpeg",
            "b51210cbdf6c434c96604a835aafa8b6.jpeg"
    );
    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final EntityManager em;
    private final PasswordEncoder passwordEncoder;

    public Seeder(
            CommunityRepository communityRepo,
            UserRepository userRepo,
            PostRepository postRepo,
            EntityManager em,
            PasswordEncoder passwordEncoder
    ) {
        this.communityRepo = communityRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.em = em;
        this.passwordEncoder = passwordEncoder;
    }

    private static final class PostCreatedAtUpdate {
        Long postId;
        LocalDateTime createdAt;
        PostCreatedAtUpdate(Long postId, LocalDateTime createdAt) {
            this.postId = postId;
            this.createdAt = createdAt;
        }
    }

    @Override
    @Transactional
    public void run(String... args) {
        // neseeduj znova, ak už máš dáta
        if (postRepo.count() > 0) return;

        Random rnd = new Random();
        LocalDateTime now = LocalDateTime.now();

        // 1) USERS (User.password + isElderOwl sú povinné) :contentReference[oaicite:5]{index=5}
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 25; i++) {
            User u = new User();
            u.setName("Demo User " + i);
            u.setEmail("demo" + i + "@example.com");
            u.setDescription("Seed user #" + i);
            u.setImage(UPLOAD_IMAGES.get(rnd.nextInt(UPLOAD_IMAGES.size())));
            u.setIsElderOwl(i % 10 == 0); // každý 10. nech je elder

            // heslo nech je validné (encoded), aby to sedelo so security
            u.setPassword(passwordEncoder.encode("Admin123"));

            users.add(u);
        }
        userRepo.saveAll(users);

        // 2) COMMUNITY (creator je povinný) :contentReference[oaicite:6]{index=6}
        User creator = users.get(0);

        Community community = new Community();
        community.setName("Demo Community");
        community.setDescription("Auto-seedovaná komunita na testovanie feedu.");
        community.setImage(UPLOAD_IMAGES.get(rnd.nextInt(UPLOAD_IMAGES.size())));
        community.setCreator(creator);

        // pridaj členov (pomocná metóda rieši aj druhú stranu) :contentReference[oaicite:7]{index=7}
        for (int i = 0; i < users.size(); i++) {
            community.addMember(users.get(i));
        }

        communityRepo.save(community);

        // 3) POSTS + LIKES + IMAGES + COMMENTS
        List<PostCreatedAtUpdate> createdAtUpdates = new ArrayList<>();

        for (int i = 1; i <= 100; i++) {
            Post p = new Post();
            p.setCommunity(community);
            p.setAuthor(users.get(rnd.nextInt(users.size())));

            // aspoň text (Post validate vyžaduje text alebo obrázok) :contentReference[oaicite:8]{index=8}
            p.setText(randomPostText(rnd, i));

            // občas sprav image/mixed post
            int imgCount = rnd.nextInt(4); // 0..3
            if (imgCount > 0) {
                List<String> pool = new ArrayList<>(UPLOAD_IMAGES);
                Collections.shuffle(pool, rnd);

                for (int k = 0; k < imgCount; k++) {
                    String name = pool.get(k);

                    // ak potrebuješ prefix, daj napr:
                    // String url = "uploads/" + name;
                    String url = name;

                    ImagePost ip = new ImagePost(url, p, k);
                    p.getImagePosts().add(ip);
                }
            }


            // nastav type (inak si ho prepočíta prePersist, ale tu je to explicitné)
            boolean hasText = p.getText() != null && !p.getText().trim().isEmpty();
            boolean hasImages = p.getImagePosts() != null && !p.getImagePosts().isEmpty();
            p.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

            // likes (0..18)
            int likeCount = rnd.nextInt(19);
            for (int k = 0; k < likeCount; k++) {
                p.getLikes().add(users.get(rnd.nextInt(users.size()))); // post_likes(post_id, user_id) :contentReference[oaicite:10]{index=10}
            }

            // comments (0..3)
            int commentCount = rnd.nextInt(4);
            for (int k = 0; k < commentCount; k++) {
                User commenter = users.get(rnd.nextInt(users.size()));
                Comment cmt = new Comment(randomCommentText(rnd), p, commenter); // post+author povinné :contentReference[oaicite:11]{index=11}
                p.getComments().add(cmt);
            }

            // ulož post (prePersist mu dá id a createdAt=now) :contentReference[oaicite:12]{index=12}
            postRepo.save(p);

            // chceme random createdAt v poslednom roku -> urobíme update po inserte
            LocalDateTime randomCreatedAt = now
                    .minusDays(rnd.nextInt(365))
                    .minusHours(rnd.nextInt(24))
                    .minusMinutes(rnd.nextInt(60));

            createdAtUpdates.add(new PostCreatedAtUpdate(p.getId(), randomCreatedAt));
        }

        // flush insertov
        em.flush();

        // 4) Prepíš created_at native UPDATE (lebo Post.prePersist ho vždy nastaví na now) :contentReference[oaicite:13]{index=13}
        for (int i = 0; i < createdAtUpdates.size(); i++) {
            PostCreatedAtUpdate upd = createdAtUpdates.get(i);

            em.createNativeQuery("UPDATE post SET created_at = ? WHERE id = ?")
                    .setParameter(1, Timestamp.valueOf(upd.createdAt))
                    .setParameter(2, upd.postId)
                    .executeUpdate();
        }

        em.flush();
    }

    private String randomPostText(Random rnd, int i) {
        String[] starts = {"Dnes som riešil", "Rýchly tip:", "Narazil som na", "Skúšam", "Hot take:"};
        String[] mids = {"Spring Boot", "TanStack Router", "React Query", "PostgreSQL", "Docker", "JWT auth"};
        String[] ends = {
                "a išlo to lepšie než som čakal.",
                "a mám z toho zvláštny bug.",
                "— máte niekto podobne?",
                "a toto je môj fix.",
                "a chcem to spraviť čistejšie."
        };
        return starts[rnd.nextInt(starts.length)] + " " +
                mids[rnd.nextInt(mids.length)] + " " +
                ends[rnd.nextInt(ends.length)] + " (#" + i + ")";
    }

    private String randomCommentText(Random rnd) {
        String[] c = {
                "Nice.", "Toto sa mi stalo tiež 😅", "Dobrý point.", "Skús pozrieť logy.", "Top!"
        };
        return c[rnd.nextInt(c.length)];
    }
}
