package dev.bolko.twilightapi.controllers;

import dev.bolko.twilightapi.dto.FriendDto;
import dev.bolko.twilightapi.dto.FriendRequestDto;
import dev.bolko.twilightapi.model.Friendship;
import dev.bolko.twilightapi.model.User;
import dev.bolko.twilightapi.repositories.FriendshipRepository;
import dev.bolko.twilightapi.repositories.UserRepository;
import dev.bolko.twilightapi.services.UserService;
import dev.bolko.twilightapi.utils.FriendshipStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticatedPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/f")
@RequiredArgsConstructor
public class FriendsController {

    private final UserRepository userRepo;
    private final FriendshipRepository friendshipRepo;
    private final UserService userService;

    // 1) send request: POST /friends/request/{userId}
    @PostMapping("/request/{userId}")
    public void request(@PathVariable UUID userId, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        User me = userRepo.findUserByEmail(user.getEmail());
        User other = userRepo.findById(userId).orElseThrow();

        if (friendshipRepo.findByRequesterIdAndAddresseeId(me.getId(), other.getId()).isPresent()) return;

        Friendship f = new Friendship();
        f.setRequester(me);
        f.setAddressee(other);
        f.setStatus(FriendshipStatus.PENDING);
        friendshipRepo.save(f);
    }

    // 2) accept request: POST /friends/accept/{friendshipId}
    @PostMapping("/accept/{id}")
    public void accept(@PathVariable UUID id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        User me = userRepo.findUserByEmail(user.getEmail());
        Friendship f = friendshipRepo.findById(id).orElseThrow();

        if (!f.getAddressee().getId().equals(me.getId())) return;

        f.setStatus(FriendshipStatus.ACCEPTED);
        friendshipRepo.save(f);
    }

    // 3) list friends: GET /friends
    @GetMapping
    public List<FriendDto> friends(@AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        User me = userRepo.findUserByEmail(user.getEmail());

        List<Friendship> rows = friendshipRepo.findByStatusAndRequesterIdOrStatusAndAddresseeId(
                FriendshipStatus.ACCEPTED, me.getId(),
                FriendshipStatus.ACCEPTED, me.getId()
        );

        List<FriendDto> out = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Friendship f = rows.get(i);

            User other;
            if (f.getRequester().getId().equals(me.getId())) {
                other = f.getAddressee();
            } else {
                other = f.getRequester();
            }

            out.add(new FriendDto(other.getId(), other.getName(), other.getImage()));
        }

        return out;
    }

    @GetMapping("/requests/incoming")
    public List<FriendRequestDto> incoming(@AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));

        User me = userRepo.findUserByEmail(user.getEmail());

        List<Friendship> rows = friendshipRepo.findByStatusAndAddresseeId(
                FriendshipStatus.PENDING, me.getId()
        );

        List<FriendRequestDto> out = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Friendship f = rows.get(i);
            User from = f.getRequester();
            out.add(new FriendRequestDto(f.getId(), from.getName(), from.getImage()));
        }

        return out;
    }

    @PostMapping("/decline/{id}")
    public void decline(@PathVariable UUID id, @AuthenticationPrincipal User principal) {
        User user = userService.getCurrentUser(principal).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated"));
        User me = userRepo.findUserByEmail(user.getEmail());

        Friendship f = friendshipRepo.findById(id).orElseThrow();

        if (!f.getAddressee().getId().equals(me.getId())) return;

        friendshipRepo.delete(f);
    }
}
