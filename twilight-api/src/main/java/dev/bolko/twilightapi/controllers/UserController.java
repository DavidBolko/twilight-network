package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.SidebarDto;
import dev.bolko.twilightapi.model.Community;
import dev.bolko.twilightapi.repositories.CommunityRepository;
import dev.bolko.twilightapi.services.ImageService;
import dev.bolko.twilightapi.dto.UserDto;
import dev.bolko.twilightapi.model.Comment;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.CommentRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.UserService;
import lombok.RequiredArgsConstructor;
import org.hibernate.Hibernate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final ImageService imageService;
    private final UserRepository userRepo;
    private final CommentRepository commentRepo;
    private final CommunityRepository communityRepo;

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUser(@PathVariable UUID id) {
        User user = userRepo.findById(id).orElseThrow();
        List<Comment> allComments = commentRepo.findAll();
        return ResponseEntity.ok(new UserDto(user, allComments));
    }


    @PutMapping("/{id}/avatar")
    public ResponseEntity<String> changeUserAvatar(@PathVariable UUID id, @RequestParam("file") MultipartFile file, @AuthenticationPrincipal User principal) {
        User principalUser = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        boolean isSelf = principalUser.getId().equals(id);
        if (!isSelf) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        try {
            User user = userRepo.findById(id).orElseThrow();

            String filename = imageService.saveImage(file);
            user.setImage(filename);

            userRepo.save(user);

            return ResponseEntity.ok(filename);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload avatar: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/description")
    public ResponseEntity<String> changeUserDescription(@PathVariable UUID id, @RequestParam String description, @AuthenticationPrincipal User principal) {
        User principalUser = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        boolean isSelf = principalUser.getId().equals(id);
        if (!isSelf) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Not allowed");
        }

        User user = userRepo.findById(id).orElseThrow();
        user.setDescription(description);
        userRepo.save(user);

        return ResponseEntity.ok(description);
    }

    @GetMapping("/sidebar")
    public SidebarDto getSidebar(@AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        List<Community> owned = communityRepo.findOwnedByUser(user.getId());
        List<Community> member = communityRepo.findMemberByUser(user.getId());

        Set<Long> ownedIds = owned.stream().map(Community::getId).collect(Collectors.toSet());
        member = member.stream().filter(c -> !ownedIds.contains(c.getId())).toList();

        Function<Community, SidebarDto.CommunityItem> mapItem = c -> {
            Hibernate.initialize(c.getMembers());
            Hibernate.initialize(c.getPosts());
            int membersCount = c.getMembers() == null ? 0 : c.getMembers().size();
            int postsCount = c.getPosts() == null ? 0 : c.getPosts().size();
            return new SidebarDto.CommunityItem(c.getId(), c.getName(), c.getImage(), membersCount, postsCount);
        };

        List<SidebarDto.CommunityItem> ownedItems = owned.stream().map(mapItem).toList();
        List<SidebarDto.CommunityItem> memberItems = member.stream().map(mapItem).toList();

        List<SidebarDto.FriendItem> friends = List.of();
        return new SidebarDto(ownedItems, memberItems, friends);
    }


}
