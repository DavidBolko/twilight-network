import { FC, useContext } from "react";
import PostCard from "../PostCard";
import { useQuery } from "react-query";
import { fetcher } from "../../utils";
import { UserContext } from "../../store";
import axios from "axios";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";
import { Post } from "../../types";


type props={
  userID: string
}

const PostTab: FC<props> = (props) => {
  const {data, refetch} = useQuery<Post[]>("userPosts", async ()=> await axios.get(`/api/p/createdById/${props.userID}`).then((res) => res.data), {refetchOnWindowFocus:false})
  console.log(data);
  
  const user = useContext(UserContext)
  if(data){
    return (
      <ul className="flex flex-col gap-2 mt-2">
        {data.map((ele) => (
          <PostCard saved={ele.savedBy.some((e)=>{return e.id == user.id})} cardType="profile" comments={ele._count.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele._count.likedBy} title={ele.title} type={ele.type} liked={ele.likedBy.some((e) => { return e.id == user.id; })} likedBy={ele.likedBy}/>
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
