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
  comID: string;
  userId: string;
  savedBy: [{ id: string }];
  likedBy: [{ id: string }];
  community: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    likedBy: number;
  };
}
