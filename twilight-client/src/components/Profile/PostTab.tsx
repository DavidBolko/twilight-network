import { FC } from "react";
import PostCard from "../PostCard";
import { useQuery } from "react-query";
import { fetcher } from "../../utils";



type tabsProps = {
  user: string;
};

type community = {
  displayName: string;
  id: string;
  Img: string;
}

type data = [
  {
    author: {
      displayName: string;
    };
    comments: number;
    community: community
    content: string;
    type: string;
    id: string;
    likeCount: number;
    title: string;
    userId: string;
    liked: boolean;
  }
];

const PostTab: FC<tabsProps> = (tabsProps) => {
  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/user/followed`),
    queryKey: ["followed"],
    refetchOnWindowFocus: false,
    retry: false,
  });
  console.log(data);
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {data?.map((ele) => (
        <PostCard cardType="com" author={ele.author} comments={ele.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele.likeCount} title={ele.title} type={ele.type} userId={ele.userId} liked={ele.liked} />
      ))}
    </ul>
  );
};

export default PostTab