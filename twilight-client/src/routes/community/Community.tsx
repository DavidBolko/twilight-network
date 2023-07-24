import { useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useSWR from "swr";
import { CDN, fetcher } from "../../utils";
import ErrorPage from "../ErrorPage";
import PostCardCommunity from "../../components/PostCardCommunity";
import { useQuery } from "react-query";
import { CheckIcon } from "@heroicons/react/24/outline";

type Posts = [
  {
    likes: number,
    comments: [{}],
    content: string,
    types: string,
    author:{
      displayName: string
    }
  }
]

interface commuity{
  displayName: string;
  desc: string;
  Img: string;
  likes: number
  Users: string[],
  Posts: Posts
}

type data = {
  community: commuity,
  followed: boolean
};

const Community = () => {
  const params = useParams();

  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/c/${params.cName}`),
    refetchOnWindowFocus: false,
  });

  const handleFollow = async () => {
    const res = await fetch(`/api/c/${params.cName}/follow`, {
      method: "PUT",
      body: "",
    });
    if (res.ok) {
      refetch();
    }
  };


  console.log(data);
  if (isError) {
    return <ErrorPage error={JSON.parse(error.message)} />;
  } else if (isLoading) {
    return (
      <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4 blur-lg">
        <main className="flex col-span-2 col-start-2">
          <ul className="flex flex-col gap-6">
            <PostCardCommunity img="xa" author="TheSillus" comments={321} />
            <PostCardCommunity img="ba" author="TheSillus" comments={321} />
            <PostCardCommunity img="hi" author="TheSillus" comments={321} />
            <PostCardCommunity img="he" author="TheSillus" comments={321} />
          </ul>
        </main>
        <div className="flex flex-col gap-2 p-4 text-justify bg-slate-700 h-fit rounded-lg">
          <div className="flex gap-2">
            <div>
              <h1 className="text-3xl">Jennie</h1>
              <p>62k followers</p>
            </div>
          </div>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates mollitia unde vel consectetur aliquid dolores ratione adipisci magni inventore ducimus? Non
            explicabo aliquam, vitae dignissimos consequuntur culpa id quae necessitatibus.
          </p>
          <a className="button-colored" href="#">
            Make a post
          </a>
          <button className="button-colored" onClick={handleFollow}>
            Follow
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4">
      <main className="flex col-span-2 col-start-2">
        <ul className="flex flex-col-reverse gap-6">
          {data?.community.Posts.map((ele) => (
            <PostCardCommunity img={ele.content} author={ele.author.displayName} comments={ele.comments.length} likes={ele.likes}/>
          ))}
        </ul>
      </main>
      <div className="flex flex-col gap-2 p-4 text-justify bg-nord-snow-200 dark:bg-nord-night-300 h-fit rounded-lg">
        <div className="flex gap-2">
          <img src={CDN(data?.community.Img!)} alt="" className="w-16 h-16 rounded-full" />
          <div>
            <h1 className="text-3xl">Jennie</h1>
            <p>{data?.community.Users.length} followers</p>
          </div>
        </div>
        <p>{data?.community.desc}</p>
        <div className="flex gap-2">
          <a className="button-normal" href={`/p/create?com=${params.cName}`}>Make a post</a>
          {data?.followed == true
          ? <button className="button-colored-active flex items-center" onClick={handleFollow}> <span><CheckIcon width={20} height={20}/></span> Followed </button>
          : <button className="button-colored" onClick={handleFollow}> Follow </button>
          }
        </div>
      </div>
    </section>
  );
};

export default Community;
