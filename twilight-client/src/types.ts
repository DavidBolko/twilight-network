export type User = {
  id: string;
  name: string;
  image?: string;
};

export type Comment = {
  id: number;
  text: string;
  author: User;
};

export type PostType = {
  id: string;
  title: string;
  text: string;
  communityId: number;
  communityName: string;
  communityImage: string;
  author: User;
  images?: string[];
  likes: User[];
  comments?: Comment[];
};

export type Community = {
  id: string;
  name: string;
  description?: string;
  imageUrl: string;
  posts: PostType[];
  members: User[];
};

export type FullUser = {
  id: string;
  name: string;
  image?: string;
  posts: PostType[];
  description: string;
  communities: Community[];
};
