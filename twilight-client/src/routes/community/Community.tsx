import { useParams } from "react-router-dom";;
import { CDN, fetcher } from "../../utils";
import ErrorPage from "../ErrorPage";
import { useQuery } from "react-query";
import { CheckIcon } from "@heroicons/react/24/outline";
import PostCard from "../../components/PostCard";
import PostCardSkeleton from "../../components/Skeletons/PostCardSkeleton";
import axios, { AxiosError } from "axios";
import sadImage from "../../../public/sad.svg"

const Community = () => {
  const params = useParams();

  const { isLoading, isError, error, data, refetch } = useQuery<api_data, AxiosError>({
    queryFn: async() => await axios.get(`/api/c/${params.id}`),
    refetchOnWindowFocus: false,
  });


  const handleFollow = async () => {
    const res = await fetch(`/api/c/${params.id}/follow`, {
      method: "PUT",
      body: "",
    });
    if (res.ok) {
      refetch();
    }
  };
  
  console.log(data);
  

  if(data){
    return (
      <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4 ">
        <main className="flex col-span-2 col-start-2 justify-center">
          {data.data.community.Posts.length > 0 ?
          <ul className="flex gap-6 w-full">
            {data.data.community.Posts.map((ele) => (
              <PostCard cardType="com" likedBy={ele.likedBy} liked={ele.likedBy.some((e)=>{return e.id == ele.id})} author={ele.author} comments={ele._count.comments > 0 ? ele._count.comments : 0} community={data.data.community} refetch={refetch} content={ele.content} id={ele.id} preview={true} likeCount={ele._count.likedBy} title={ele.title} type={ele.type}/>
            ))}
          </ul>
          : <div className="flex flex-col items-center   text-center">
            <img className="w-1/2" src={sadImage} alt="SadImage" />
            <h1 className="text-4xl">It's so empty here...</h1>
            <p className="text-xl">No posts found in this community</p>
            <p className="italic mt-8">Be first and make a post 💙</p>
          </div>
          }
        </main>
        <div className="flex flex-col gap-2 p-4 text-justify shadow-twilight bg-twilight-100 dark:bg-twilight-700 h-fit rounded-lg">
          <div className="flex gap-2">
            <img src={CDN(data.data.community.Img!)} alt="" className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-3xl">Jennie</h1>
              <p>{data.data.community.Users.length} followers</p>
            </div>
          </div>
          <p>{data.data.community.desc}</p>
          <div className="flex gap-2">
            <a className="button-normal" href={`/p/create?com=${data.data.community.id}`}>
              Make a post
            </a>
            {data.data.followed == true ? (
              <button className="button-colored-active flex items-center" onClick={handleFollow}>
                {" "}
                <span>
                  <CheckIcon width={20} height={20} />
                </span>{" "}
                Followed{" "}
              </button>
            ) : (
              <button className="button-colored" onClick={handleFollow}>
                {" "}
                Follow{" "}
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }
  if (error) {
    console.log(error);
    
    return <ErrorPage status={error.response!.status} statusText={error.response!.statusText}/>;
  } 
  return (
    <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4 blur-lg">
      <main className="flex col-span-2 col-start-2">
        <ul className="flex flex-col gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
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
};

export default Community;

interface api_data{
  data:{
    community: {
      name: string
      id:string
      desc: string
      Img: string
      Users: Array<{
        id: string
      }>
      Posts: Array<{
        id: string
        title: string
        content: string
        type: string
        author: {
          name: string;
          displayName: string
          avatar: string
        }
        likedBy: [
          {id: string}
        ];
        _count: {
          likedBy: number
          comments: number
        }
      }>
    }
    followed: boolean
  }
}