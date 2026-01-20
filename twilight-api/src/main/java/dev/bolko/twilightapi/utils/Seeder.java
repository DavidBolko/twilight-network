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

//@Profile("dev")
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

        for (int i = 1; i <= 100; i++) {
            Post p = new Post();
            p.setCommunity(community);
            p.setAuthor(users.get(rnd.nextInt(users.size())));

            LocalDateTime created = now.minusDays(rnd.nextInt(365)).minusHours(rnd.nextInt(24)).minusMinutes(rnd.nextInt(60));
            p.setCreatedAt(created);

            String text = randomPostText(rnd);
            boolean hasText = rnd.nextInt(10) != 0;
            p.setText(hasText ? text : null);

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

            if (!hasText && !hasImages) {
                p.setText(text);
                hasText = true;
            }

            p.setType(hasText && hasImages ? PostType.MIXED : hasImages ? PostType.IMAGE : PostType.TEXT);

            int likeCount = rnd.nextInt(19);
            for (int k = 0; k < likeCount; k++) {
                p.getLikes().add(users.get(rnd.nextInt(users.size())));
            }

            postRepo.save(p);
        }
    }

    private String randomPostText(Random rnd) {
        String lorem = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque justo ipsum, ullamcorper sed dui a, rutrum condimentum eros. Praesent hendrerit erat nunc, a mollis ligula viverra at. Proin porttitor tincidunt risus, eget fringilla erat tempor quis. Maecenas placerat laoreet mauris, a bibendum orci pellentesque vitae. Suspendisse sed urna tortor. Donec efficitur pulvinar aliquam. Proin lobortis dolor vel augue commodo semper. Pellentesque massa massa, vulputate eu nisl a, mollis congue turpis. Pellentesque a lectus ac nibh molestie venenatis consectetur nec diam. Donec congue non odio eget rutrum. Suspendisse pellentesque lacus sit amet gravida tempus. Nunc tempus vitae nibh a venenatis. In feugiat odio ac urna mattis iaculis ac sit amet tortor. In hac habitasse platea dictumst. Phasellus ut nulla tellus.\n" +
                "\n" +
                "Aenean aliquam ipsum et purus euismod, vel mollis leo aliquam. Cras ultricies elit faucibus, faucibus tortor sed, blandit nibh. Nulla sollicitudin ipsum vel tincidunt consectetur. Fusce vulputate eros erat. Fusce nec fringilla nisi. Donec auctor nisi at tortor iaculis, quis blandit tellus ullamcorper. Quisque vitae massa rhoncus, consectetur sem et, feugiat metus. Phasellus at faucibus eros. Vestibulum fermentum eros lacus, in viverra nibh pulvinar at. Maecenas id scelerisque dui, sit amet auctor lorem. In orci ipsum, lobortis et tempor sit amet, molestie quis massa. Nunc tincidunt pretium est, et tristique mi tempus ac. Integer laoreet quam eu mi euismod mattis. In mollis rutrum luctus.\n" +
                "\n" +
                "Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Aliquam ac est tincidunt, pulvinar libero sed, faucibus libero. Nulla massa mi, vulputate at viverra sed, tristique ac arcu. Cras quis libero sit amet nisi vestibulum cursus. Proin non lobortis metus. Nunc lacinia nisi sit amet ornare cursus. Proin eu dui ut metus condimentum pretium non sed magna. Integer sed turpis sed tortor placerat condimentum sit amet a nisi. Integer accumsan mollis velit eget facilisis. Phasellus nec convallis magna, sed rhoncus nulla. Fusce laoreet lectus faucibus odio gravida pharetra nec at nisl. Suspendisse fermentum mollis sapien vitae laoreet. In laoreet nec lorem at efficitur. Curabitur eu justo eu quam bibendum ultrices. Nunc dignissim mattis sollicitudin. Donec est est, consequat id sodales quis, pellentesque et lacus.";
        return lorem.substring(0, rnd.nextInt()%lorem.length());
    }
}
