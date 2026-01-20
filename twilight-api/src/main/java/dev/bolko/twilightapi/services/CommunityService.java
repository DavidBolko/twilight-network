package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.dto.CommunityDto;
import dev.bolko.twilightapi.model.Category;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CategoryRepository;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.PostRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final InputValidatorService validator;
    private final ImageService imageService;
    private final CommunityRepository communityRepo;
    private final UserRepository userRepo;
    private final PostRepository postRepo;
    private final CategoryRepository categoryRepo;

    @Transactional
    public CommunityDto create(String name, String description, Long categoryId, MultipartFile image, User me) {
        String validationError = validator.validateCommunityInput(name, description, image);
        if (validationError != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, validationError);

        if (communityRepo.findByName(name).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name already exists");
        }

        Category category = null;
        if (categoryId != null) {
            category = categoryRepo.findById(categoryId).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        }

        String filename;
        if (image != null && !image.isEmpty()) {
            try {
                filename = imageService.saveImage(image);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save community image");
            }
        } else {
            int n = new Random().nextInt(1, 4); // 1..3
            filename = "community" + n + ".png";
        }

        Community c = new Community(name, description, filename, me);
        c.setCategory(category);
        c.addMember(me);

        communityRepo.save(c);
        userRepo.save(me);

        return new CommunityDto(c);
    }

    @Transactional(readOnly = true)
    public List<CommunityDto> list(String query, Long categoryId) {
        String q = (query == null) ? "" : query.trim();

        List<Community> communities;

        boolean hasQuery = !q.isEmpty();
        boolean hasCategory = categoryId != null;

        if (hasQuery && hasCategory) {
            communities = communityRepo.findByCategoryIdAndNameContainingIgnoreCase(categoryId, q);
        } else if (hasCategory) {
            communities = communityRepo.findByCategoryId(categoryId);
        } else if (hasQuery) {
            communities = communityRepo.findByNameContainingIgnoreCase(q);
        } else {
            communities = communityRepo.findAll();
        }

        return communities.stream()
                .map(CommunityDto::new)
                .toList();
    }


    @Transactional(readOnly = true)
    public CommunityDto getCommunity(Long id) {
        Community com = communityRepo.findWithMembersById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        long postCount = postRepo.countByCommunityId(com.getId());
        return new CommunityDto(com, postCount);
    }

    @Transactional
    public void joinUser(Long communityId, User me) {
        Community community = communityRepo.findById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        if (me.getCommunities().contains(community)) {
            me.getCommunities().remove(community);
            community.getMembers().remove(me);
        } else {
            me.getCommunities().add(community);
            community.getMembers().add(me);
        }

        userRepo.save(me);
    }

    @Transactional(readOnly = true)
    public List<CommunityDto> search(String query) {
        List<Community> communities = communityRepo.findByNameContainingIgnoreCase(query);
        return communities.stream().map(CommunityDto::new).toList();
    }
}
