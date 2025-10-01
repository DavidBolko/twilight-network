import axios from "axios";
import { FC } from "react";
import { useQuery } from "react-query";
import PostCard from "../PostCard";
import PostCardSkeleton from "../Skeletons/PostCardSkeleton";

const SavedPosts: FC<props> = (props) => {
  const { data, refetch } = useQuery<apiResponse>("savedPosts", async () => await axios.get(`/api/p/savedById/${props.userID}`).then((res) => res.data), { refetchOnWindowFocus: false });
  if(data){
    return (
    <ul className="flex flex-col gap-2 mt-2">
        {data.map((ele) => (
            <PostCard saved={ele.savedBy.some((e)=>{return e.id == props.userID})} cardType="profile" comments={ele._count.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele._count.likedBy} title={ele.title} type={ele.type} liked={ele.likedBy.some((e) => { return e.id == props.userID })} likedBy={ele.likedBy}/>
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

type props = {
    userID: string;
  };
  
type apiResponse = Array<{
    id: string
    title: string
    type: string
    content: string
    comID: string
    userId: string,
    savedBy:[
    {id:string},
    ],
    likedBy:[
    {id:string},
    ],
    community: {
    id: string
    name: string
    }
    _count: {
    comments: number
    likedBy: number
    }
}>

export default SavedPosts;
