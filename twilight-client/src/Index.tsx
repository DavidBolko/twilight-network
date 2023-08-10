import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { Sidebar } from "./components/Sidebar";
import Navbar from "./components/Navbar";
import PostCard from "./components/PostCard";
import { fetcher } from "./utils";
import { useQuery } from "react-query";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import ErrorPage from "./routes/ErrorPage";
import { useNavigate } from "react-router-dom";

type data = [
  {
    author: {
      displayName: string;
    };
    comments: number;
    community: {
      displayName: string;
      id: string;
      Img: string;
    };
    content: string;
    type: string;
    id: string;
    likeCount: number;
    title: string;
    userId: string;
    liked:boolean
  }
];

export const Index = () => {
  const navigate = useNavigate()
  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/user/followed`),
    queryKey: ["followed"],
    refetchOnWindowFocus: false,
    retry:false
  });

  if (data) {
    console.log(data);
    return (
      <section className="flex p-4 pt-16 mr-auto ml-auto max-w-[900px] lg:col-start-2">
        <ul className="flex flex-col-reverse w-full gap-2">
          {data?.map((ele) => (
            <PostCard
              cardType=""
              author={ele.author}
              comments={ele.comments}
              community={ele.community}
              refetch={refetch}
              content={ele.content}
              id={ele.id}
              likeCount={ele.likeCount}
              title={ele.title}
              type={ele.type}
              userId={ele.userId}
              liked={ele.liked}
            />
          ))}
        </ul>
      </section>
    );
  }
  if (isError && JSON.parse(error?.message).status == 401) {
    navigate("/auth")
  }
  if (isError && JSON.parse(error?.message).status == 404) {
    return (
      <section className="flex flex-col items-center justify-center p-4 pt-20 mr-auto ml-auto max-w-[800px] lg:col-start-2 gap-2">
        <p>You don't follow any communities</p>
        <a href="" className="button-colored">Let's explore</a>
      </section>
    );
  }
  return (
    <section className="flex p-4 pt-16 mr-auto ml-auto max-w-[800px] lg:col-start-2">
      <ul className="flex flex-col gap-6 w-full">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </ul>
    </section>
  );
};
