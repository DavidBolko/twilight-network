export type Mood = "mysterious" | "moody" | "enchanted" | "haunted" | "serene";
export type Sort = "new" | "hot" | "best";
export type TimeRange = "day" | "week" | "month" | "year" | "all";

export type User = {
  id: string;
  name: string;
  email: string;
  image?: string;
  isElder: boolean;
  online: boolean;
};

export type Comment = {
  id: number;
  text: string;
  author: User;
  communityNightOwlsId: string[]; 
};
export type Community = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  members: User[];
  postCount: number;
  communityNightOwlsId: string[];
  creatorId: string;
};
export type PostType = {
  id: string;
  text: string;
  communityId: number;
  communityName: string;
  communityImage: string;
  communityNightOwlsId: string[];
  author: User;
  images?: string[];
  likes: User[];
  saved: boolean;
  createdAt: string;
};

export type FullUser = {
  id: string;
  name: string;
  image?: string;
  posts: PostType[];
  description: string;
  communities: Community[];
  saved: PostType[];
  isElder: boolean;
};
export type SidebarType = {
  ownedCommunities: {
    id: number;
    name: string;
    image?: string | null;
    membersCount: number;
    postsCount: number;
  }[];
  memberCommunities: {
    id: number;
    name: string;
    image?: string | null;
    membersCount: number;
    postsCount: number;
  }[];
  friends: User[]; 
  chatComingSoon: boolean;
};
