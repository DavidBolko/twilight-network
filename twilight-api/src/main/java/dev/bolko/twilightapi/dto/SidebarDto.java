package dev.bolko.twilightapi.dto;

import java.util.List;

public class SidebarDto {

    public List<CommunityItem> ownedCommunities;
    public List<CommunityItem> memberCommunities;

    // chat neskôr
    public List<FriendItem> friends;
    public boolean chatComingSoon = true;

    public SidebarDto() {}

    public SidebarDto(List<CommunityItem> owned, List<CommunityItem> member, List<FriendItem> friends) {
        this.ownedCommunities = owned;
        this.memberCommunities = member;
        this.friends = friends;
    }

    public static class CommunityItem {
        public Long id;
        public String name;
        public String image;
        public int membersCount;
        public int postsCount;

        public CommunityItem() {}

        public CommunityItem(Long id, String name, String image, int membersCount, int postsCount) {
            this.id = id;
            this.name = name;
            this.image = image;
            this.membersCount = membersCount;
            this.postsCount = postsCount;
        }
    }

    public static class FriendItem {
        public String id;
        public String name;
        public boolean online;

        public FriendItem() {}

        public FriendItem(String id, String name, boolean online) {
            this.id = id;
            this.name = name;
            this.online = online;
        }
    }
}
