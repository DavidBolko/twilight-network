import PostCard from "./components/PostCard";
import { useInfiniteQuery } from "react-query";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import { useInView } from 'react-intersection-observer'
import { useContext, useEffect } from "react";
import axios from "axios";
import { UserContext } from "./store";

export const Index = () => {
  const { fetchNextPage, hasNextPage, data, refetch, error} = useInfiniteQuery(['posts'], ({ pageParam = '' }) => fetchPosts({pageParam}), {
    getNextPageParam: (lastPage, allPages) => lastPage.nextId ?? false,
  })
  
  const { inView, ref } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])
  
  const user = useContext(UserContext);  
  console.log(user);
  

  if (data && data?.pages[0].posts.length>0) {
    return (
      <main className="flex p-1 md:p-4 mr-auto ml-auto max-w-[750px] lg:col-start-2">
        <section className="flex flex-col gap-2 pt-12 w-full ">
          {data.pages.flatMap((page, i)=>{
            return(
              <ul className="flex flex-col gap-2" key={i}>
                {page.posts.map((ele)=>{
                  return <li key={ele.id}><PostCard cardType="" likedBy={ele.likedBy} liked={ele.likedBy.some((e)=>{return e.id == user.id})} author={ele.author} comments={ele._count.comments > 0 ? ele._count.comments : 0} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} preview={true} likeCount={ele._count.likedBy} title={ele.title} type={ele.type}/></li>
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
            <li key={1}><PostCardSkeleton /></li>
            <li key={2}><PostCardSkeleton /></li>
            <li key={3}><PostCardSkeleton /></li>
            <li key={4}><PostCardSkeleton /></li>
          </ul>
        </section>
      </main>
    );
  }
  return (
    <main className="flex p-1 md:p-4 relative top-12 mr-auto ml-auto max-w-[750px] lg:col-start-2">
      <section className="w-full">
        <ul className="flex flex-col gap-6 w-full">
          <li key={1}><PostCardSkeleton /></li>
          <li key={2}><PostCardSkeleton /></li>
          <li key={3}><PostCardSkeleton /></li>
          <li key={4}><PostCardSkeleton /></li>
        </ul>
      </section>
    </main>
  );
};

type data = [{
  author: {
    name:string;
    displayName: string;
  };
  community?: {
    name:string;
    displayName: string;
    id: string;
    Img: string;
  };
  content: string;
  id: string;
  _count:{
    comments:number;
    likedBy:number;
  }
  likedBy: [
    {id: string}
  ];
  title: string;
  userId?: string;
  type:string, 
}];


const fetchPosts = async ({pageParam = ''}: {pageParam: string}): Promise<{ posts: data; nextId: string }> => {
  const res = await axios.get(`/api/p?cursor=${pageParam}`)
  return res.data
}
