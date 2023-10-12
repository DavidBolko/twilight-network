import { FC, useContext } from "react";
import PostCard from "../PostCard";
import { useQuery } from "react-query";
import { fetcher } from "../../utils";
import { UserContext } from "../../store";
import axios from "axios";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";


type props={
  userID: string
}

const PostTab: FC<props> = (props) => {
  const {data, refetch} = useQuery<posts>("userPosts", async ()=> await axios.get(`/api/p/createdById/${props.userID}`).then((res) => res.data), {refetchOnWindowFocus:false})
  console.log(data);
  
  const user = useContext(UserContext)
  if(data){
    return (
      <ul className="flex flex-col gap-2 mt-2">
        {data.map((ele) => (
          <PostCard cardType="profile" comments={ele._count.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele._count.likedBy} title={ele.title} type={ele.type} liked={ele.likedBy.some((e) => { return e.id == user.id; })} likedBy={ele.likedBy}/>
        ))}
      </ul>
    );
  }
  return (
    <ul className="flex flex-col gap-2 mt-2">
      <PostCardSkeleton/>
      <PostCardSkeleton/>
      <PostCardSkeleton/>
      <PostCardSkeleton/>
    </ul>
  );
};

export default PostTab


export type posts = Array<{
  id: string
  title: string
  type: string
  content: string
  comID: string
  userId: string
  likedBy:[
    {id:string},
  ],
  community: {
    id: string
    displayName: string
  }
  _count: {
    comments: number
    likedBy: number
  }
}>