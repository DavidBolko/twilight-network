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
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.UUID;

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
        c.addNightOwl(me);

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

        return communities.stream().map(CommunityDto::new).toList();
    }


    @Transactional(readOnly = true)
    public CommunityDto getCommunity(Long id) {
        Community com = communityRepo.findWithMembersById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        long postCount = postRepo.countByCommunityId(com.getId());
        List<String> owlIds = userRepo.findNightOwlIdsByCommunityId(com.getId());

        return new CommunityDto(com, postCount, owlIds);
    }

    @Transactional
    public void joinUser(Long communityId, User me) {
        Community community = communityRepo.findWithMembersById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));
        boolean isMember = community.getMembers().contains(me);

        if (isMember) {
            community.removeMember(me);
            if (community.getNightOwls() != null) {
                community.getNightOwls().remove(me);
            }
        } else {
            community.addMember(me);
        }

        communityRepo.save(community);
    }

    @Transactional
    public void delete(Long communityId, User me) {
        Community c = communityRepo.findWithMembersById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        boolean canDelete = c.getCreator().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!canDelete) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");

        for (User u : new HashSet<>(c.getMembers())) {
            c.removeMember(u);
        }

        if (c.getNightOwls() != null) c.getNightOwls().clear();

        communityRepo.delete(c);
    }

    @Transactional
    public void toggleNightOwl(Long communityId, UUID targetUserId, User me) {
        Community community = communityRepo.findWithMembersById(communityId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        User target = userRepo.findById(targetUserId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        boolean canPromote = community.getCreator().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!canPromote) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");

        if (me.getId().equals(target.getId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change yourself");

        if (community.getCreator().getId().equals(target.getId()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change the community owner");

        if (!community.getMembers().contains(target))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "User is not a member of this community");

        if (community.getNightOwls().contains(target)) community.getNightOwls().remove(target);
        else community.getNightOwls().add(target);

        communityRepo.save(community);
    }


    @Transactional
    public CommunityDto update(Long id, String name, String description, MultipartFile image, User me) {
        Community c = communityRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Community not found"));

        boolean canEdit = c.getCreator().getId().equals(me.getId()) || Boolean.TRUE.equals(me.getIsElderOwl());
        if (!canEdit) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");

        String finalName = (name == null) ? c.getName() : name.trim();
        String finalDesc = (description == null) ? c.getDescription() : description.trim();

        String err = validator.validateCommunityInput(finalName, finalDesc, image);
        if (err != null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, err);

        if (!finalName.equalsIgnoreCase(c.getName()) && communityRepo.findByName(finalName).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Name already exists");
        }

        c.setName(finalName);
        c.setDescription(finalDesc);

        if (image != null && !image.isEmpty()) {
            try {
                String filename = imageService.saveImage(image);
                c.setImage(filename);
            } catch (IOException e) {
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to save community image");
            }
        }

        communityRepo.save(c);

        long postCount = postRepo.countByCommunityId(c.getId());
        List<String> owlIds = userRepo.findNightOwlIdsByCommunityId(c.getId());
        return new CommunityDto(c, postCount, owlIds);
    }


}
