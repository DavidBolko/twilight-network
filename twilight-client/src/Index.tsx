import PostCard from "./components/PostCard";
import { useInfiniteQuery } from "react-query";
import PostCardSkeleton from "./components/Skeletons/PostCardSkeleton";
import { useInView } from 'react-intersection-observer'
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { UserContext } from "./store";
import { Check, Flame, ThumbsUp } from "lucide-react";
import { CDN } from "./utils";
import { Link } from "react-router-dom";
import { ApiPost, Post } from "./types";

export const Index = () => {
  const [type, setType] = useState("trending")
  const { fetchNextPage, hasNextPage, data, refetch, error} = useInfiniteQuery(['posts'], ({ pageParam = '' }) => fetchPosts({pageParam}, {type}), {
    getNextPageParam: (lastPage, allPages) => lastPage.nextId ?? false,
    retry: false
  })
  
  const { inView, ref } = useInView()
  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage()
    }
  }, [inView, hasNextPage])
  
  const user = useContext(UserContext);  
  
  if (data && data?.pages[0].posts.length>0) {
    return (
      <div className="flex flex-col lg:grid grid-cols-feed">
        <div className="relative w-full ">
          {user.id ?
            <section className="lg:absolute flex justify-items-center right-0 lg:flex-col place-content-center h-fit w-full lg:w-fit gap-2 mt-16 p-4">
              <Link to={"/profile/"+user.id} className="card flex-row gap-2 w-full items-center lg:w-fit hover:shadow-glow">
                <img src={CDN(user.avatar)} className="w-16 h-16 border-2 border-twilight-white-300/60 rounded-full object-cover" alt="" />
                <div className="flex flex-col justify-center">
                  <p className="text-sm">Hi,</p>
                  <p className="text-moonlight-300 dark:text-glow font-bold">{user.name}</p>
                </div>
              </Link>
              <ul className="flex flex-col gap-2">
                <li>
                  <button className="button-normal hover:button-colored w-full flex" onClick={(e)=>{setType("followed"), refetch}}><Check width={20} height={20}/>Followed</button>
                </li>
                <li>
                  <button className="button-normal hover:button-colored w-full flex" onClick={(e)=>{setType("recommended"), refetch}}><ThumbsUp width={20} height={20}/>Recommended</button>
                </li>
                <li>
                  <button className="button-normal hover:button-colored w-full flex" onClick={(e)=>{setType("trending"), refetch}}><Flame width={20} height={20}/>Trending</button>
                </li>
              </ul>
            </section> : ""
          }
        </div>
        <main className="flex p-4 w-full col-start-2 place-self-center">
          <section className="flex flex-col gap-2 lg:pt-16 w-full">
            {data.pages.flatMap((page, i)=>{
              return(
                <ul className="flex flex-col gap-2" key={i}>
                  {page.posts.map((ele)=>{
                    return <li key={ele.id}><PostCard author={ele.author} cardType="" likedBy={ele.likedBy} liked={ele.likedBy.some((e) => { return e.id == user.id; })} comments={ele._count.comments > 0 ? ele._count.comments : 0} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} preview={true} likeCount={ele._count.likedBy} title={ele.title} type={ele.type} saved={ele.savedBy.some((e) => { return e.id == user.id; })}/></li>
                  })}
                </ul>
              )
            })}
            <div className="mx-auto flex max-w-6xl justify-center opacity-0" ref={ref}/>
          </section>
        </main>
      </div>
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


const fetchPosts = async ({pageParam = ''}: {pageParam: string}, {type = ''}: {type: string}): Promise<{ posts: ApiPost[]; nextId: string }> => {
  const res = await axios.get(`/api/p?cursor=${pageParam}&?type=${type}`)
  return res.data
}
