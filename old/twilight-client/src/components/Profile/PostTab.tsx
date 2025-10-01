import { FC, useContext } from "react";
import PostCard from "../PostCard";
import { useQuery } from "react-query";
import { fetcher } from "../../utils";
import { UserContext } from "../../store";
import axios from "axios";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";
import { ApiPost } from "../../types";


type props={
  userID: string
}

const PostTab: FC<props> = (props) => {
  const {data, refetch} = useQuery<ApiPost[]>("userPosts", async ()=> await axios.get(`/api/p/createdById/${props.userID}`).then((res) => res.data), {refetchOnWindowFocus:false})
  console.log(data);
  
  const user = useContext(UserContext)
  if(data){
    return (
      <ul className="flex flex-col gap-2 mt-2">
        {data.map((ele) => (
          <PostCard author={ele.author} cardType="profile" likedBy={ele.likedBy} liked={ele.likedBy.some((e) => { return e.id == user.id; })} comments={ele._count.comments > 0 ? ele._count.comments : 0} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} preview={true} likeCount={ele._count.likedBy} title={ele.title} type={ele.type} saved={ele.savedBy.some((e) => { return e.id == user.id; })}/>
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
