package dev.bolko.twilightapi.utils;

import dev.bolko.twilightapi.model.*;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.PostRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Profile("dev")
@Component
public class Seeder implements CommandLineRunner {

    private static final List<String> UPLOAD_IMAGES = List.of(
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
    private final PasswordEncoder passwordEncoder;

    public Seeder(CommunityRepository communityRepo, UserRepository userRepo, PostRepository postRepo, PasswordEncoder passwordEncoder) {
        this.communityRepo = communityRepo;
        this.userRepo = userRepo;
        this.postRepo = postRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (postRepo.count() > 0) return;

        Random rnd = new Random();
        LocalDateTime now = LocalDateTime.now();

        // 1) USERS
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 25; i++) {
            User u = new User();
            u.setName("Demo User " + i);
            u.setEmail("demo" + i + "@example.com");
            u.setDescription("Seed user #" + i);
            u.setImage(UPLOAD_IMAGES.get(rnd.nextInt(UPLOAD_IMAGES.size())));
            u.setIsElderOwl(i % 10 == 0);
            u.setPassword(passwordEncoder.encode("Admin123"));
            users.add(u);
        }
        userRepo.saveAll(users);

        // 2) COMMUNITY
        User creator = users.get(0);

        Community community = new Community();
        community.setName("Demo Community");
        community.setDescription("Auto-seed komunita na testovanie feedu.");
        community.setImage(UPLOAD_IMAGES.get(rnd.nextInt(UPLOAD_IMAGES.size())));
        community.setCreator(creator);

        for (User u : users) {
            community.addMember(u);
        }
        communityRepo.save(community);

        // 3) POSTS
        for (int i = 1; i <= 100; i++) {
            Post p = new Post();
            p.setCommunity(community);
            p.setAuthor(users.get(rnd.nextInt(users.size())));

            // random createdAt v poslednom roku
            LocalDateTime created = now
                    .minusDays(rnd.nextInt(365))
                    .minusHours(rnd.nextInt(24))
                    .minusMinutes(rnd.nextInt(60));
            p.setCreatedAt(created);

            // text (väčšinou)
            String text = randomPostText(rnd, i);
            boolean hasText = rnd.nextInt(10) != 0; // 90% má text
            p.setText(hasText ? text : null);

            // images (0..3)
            int imgCount = rnd.nextInt(4);
            if (imgCount > 0) {
                List<String> pool = new ArrayList<>(UPLOAD_IMAGES);
                Collections.shuffle(pool, rnd);

                for (int k = 0; k < imgCount; k++) {
                    String url = pool.get(k);
                    ImagePost ip = new ImagePost(url, p, k);
                    p.getImagePosts().add(ip);
                }
            }

            boolean hasImages = !p.getImagePosts().isEmpty();

            // musí mať aspoň text alebo obrázok
            if (!hasText && !hasImages) {
                p.setText(text); // fallback nech je validné
                hasText = true;
            }

            p.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

            // likes 0..18
            int likeCount = rnd.nextInt(19);
            for (int k = 0; k < likeCount; k++) {
                p.getLikes().add(users.get(rnd.nextInt(users.size())));
            }

            postRepo.save(p);
        }
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
}
