export interface Post {
  author:{
    id: string
    name: string
    avatar:string
  }
  id: string;
  title: string;
  type: string;
  content: string;
  likedBy: [{ id: string }];
  community?: {
    id: string;
    name: string;
  };
}

export interface Community{
  id: string,
  name: string,
  desc: string,
  Img: string,
  createdAt: string,
  updatedAt: string,
  Users: User[],
  Posts: ApiPost[],
  followed: boolean
}


export interface ApiPost extends Post {
  savedBy: [{ id: string }];
  _count: {
    comments: number;
    likedBy: number;
  };
}

export interface User {
  avatar: string
  name: string
  id: string;
  description: string;
}
