import PostCard from "./components/PostCard";
import { useInfiniteQuery, useQuery } from "react-query";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import { useInView } from 'react-intersection-observer'
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import ErrorPage from "./routes/ErrorPage";

export const Index = () => {
  const navigate = useNavigate()
  const { fetchNextPage, fetchPreviousPage, hasNextPage, hasPreviousPage, isFetchingNextPage,isFetchingPreviousPage, data, refetch, error} = useInfiniteQuery(['posts'], ({ pageParam = '' }) => fetchPosts({pageParam}), {
    getNextPageParam: (lastPage, allPages) => lastPage.nextId ?? false,
  })
  
  const { inView, ref } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])


  if (data && data?.pages[0].posts.length>0) {
    console.log(data.pages);
    return (
      <main className="flex p-1 md:p-4 mr-auto ml-auto max-w-[750px] lg:col-start-2">
        <section className="flex flex-col gap-2 pt-12 w-full ">
          {data.pages.flatMap((page, i)=>{
            return(
              <ul className="flex flex-col gap-2">
                {page.posts.map((ele)=>{
                  return <li key={ele.id}><PostCard cardType="" author={ele.author} comments={ele.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele.likeCount} title={ele.title} type={ele.type} userId={ele.userId} liked={ele.liked}/></li>
                })}
              </ul>
            )
          })}
          <div className="mx-auto flex max-w-6xl justify-center opacity-0" ref={ref}/>
        </section>
      </main>
    );
  }
  if(error){
    return (
      <main className="flex p-1 md:p-4 relative top-12 mr-auto ml-auto max-w-[750px] lg:col-start-2">
        <section className="w-full">
          <ul className="flex flex-col gap-6 w-full">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </ul>
        </section>
      </main>
    );
  }
  return (
    <main className="flex p-1 md:p-4 relative top-12 mr-auto ml-auto max-w-[750px] lg:col-start-2">
      <section className="w-full">
        <ul className="flex flex-col gap-6 w-full">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </ul>
      </section>
    </main>
  );
};

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

const fetchPosts = async ({pageParam = ''}: {pageParam: string}): Promise<{ posts: data; nextId: string }> => {
  const res = await fetch(`/api/p?cursor=${pageParam}`)
  const data = await res.json()
  return data
}
