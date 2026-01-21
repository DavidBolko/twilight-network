package dev.bolko.twilightapi.services;

import dev.bolko.twilightapi.dto.CommunityItemDto;
import dev.bolko.twilightapi.dto.PostDto;
import dev.bolko.twilightapi.dto.UserDto;
import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final CommunityRepository communityRepo;
    private final ImageService imageService;

    public UserDto getUser(UUID id) {
        User user = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        return new UserDto(user);
    }

    public List<UserDto> getUser(String query) {
        String q = query == null ? "" : query.trim();
        if (q.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Query required");

        return userRepo.findByNameContainingIgnoreCase(q).stream().limit(20).map(UserDto::new).toList();
    }

    @Transactional(readOnly = true)
    public List<CommunityItemDto> getOwnedCommunities(User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        User me = userRepo.findById(principal.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        List<Community> owned = communityRepo.findByCreatorId(me.getId());

        return owned.stream().map(c -> new CommunityItemDto(c.getId(), c.getName(), c.getImage(), c.getMembers().size())).toList();
    }

    @Transactional(readOnly = true)
    public List<CommunityItemDto> getJoinedCommunities(User principal) {
        if (principal == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");

        User me = userRepo.findById(principal.getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        List<Community> joined = communityRepo.findByMembers_Id(me.getId());

        return joined.stream().map(c -> new CommunityItemDto(c.getId(), c.getName(), c.getImage(), c.getMembers().size())).toList();
    }

    public String changeAvatar(UUID id, MultipartFile file) throws IOException {
        User user = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        String filename = imageService.saveImage(file);
        user.setImage(filename);
        userRepo.save(user);

        return filename;
    }

    public String changeDescription(UUID id, String description) {
        User user = userRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        user.setDescription(description == null ? "" : description.trim());
        userRepo.save(user);
        return user.getDescription();
    }

    @Transactional(readOnly = true)
    public Optional<User> getCurrentUser(User principal) {
        if (principal == null) return Optional.empty();
        return userRepo.findById(principal.getId());
    }

    @Transactional
    public void toggleElder(UUID targetId, User principal) {
        if (!Boolean.TRUE.equals(principal.getIsElderOwl())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Forbidden");
        }

        if (principal.getId().equals(targetId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot change yourself");
        }
        User target = userRepo.findById(targetId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
        target.setIsElderOwl(!Boolean.TRUE.equals(target.getIsElderOwl()));
        userRepo.save(target);
    }
}
