import { useParams } from "react-router-dom";;
import { CDN } from "../../utils";
import ErrorPage from "../ErrorPage";
import { useQuery } from "react-query";
import PostCard from "../../components/PostCard";
import PostCardSkeleton from "../../components/Skeletons/PostCardSkeleton";
import axios, { AxiosError } from "axios";
import sadImage from "../../../public/sad.svg"
import { useContext } from "react";
import { UserContext } from "../../store";
import { Check } from "lucide-react";
import { Community as ApiCommunity } from "../../types";

const Community = () => {
  const params = useParams();
  const user = useContext(UserContext);  
  
  const {data, refetch,error} = useQuery<ApiCommunity, AxiosError>("community", async ()=> await axios.get(`/api/c/${params.id}`).then((res) => res.data), {refetchOnWindowFocus:false})


  const handleFollow = async () => {
    const res = await fetch(`/api/c/${params.id}/follow`, {
      method: "PUT",
      body: "",
    });
    if (res.ok) {
      refetch();
    }
  };
  
  if(data){
    return (
      <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4 ">
        <main className="flex col-span-2 col-start-2 justify-center">
          {data.Posts.length > 0 ?
          <ul className="flex flex-col gap-6 w-full">
            {data.Posts.map((ele) => (
              <PostCard saved={ele.savedBy.some((e)=>{return e.id == user.id})} cardType="com" likedBy={ele.likedBy} liked={ele.likedBy.some((e)=>{return e.id == user.id})} author={ele.author} comments={ele._count.comments > 0 ? ele._count.comments : 0}  refetch={refetch} content={ele.content} id={ele.id} preview={true} likeCount={ele._count.likedBy} title={ele.title} type={ele.type}/>
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
        <div className="flex flex-col gap-2 p-4 text-justify shadow-twilight bg-twilight-100 dark:bg-twilight-500/20 h-fit rounded-lg">
          <div className="flex gap-2">
            <img src={CDN(data.Img!)} alt="" className="w-16 h-16 rounded-full" />
            <div>
              <h1 className="text-3xl">Jennie</h1>
              <p>{data.Users.length} followers</p>
            </div>
          </div>
          <p>{data.desc}</p>
          <div className="flex gap-2">
            <a className="button-normal" href={`/c/${data.id}/create`}>
              Make a post
            </a>
            {data.followed == true ? (
              <button className="button-colored-active flex items-center" onClick={handleFollow}>
                <span><Check width={20} height={20} /></span>Followed
              </button>
              ) : (
              <button className="button-colored" onClick={handleFollow}>Follow</button>
            )}
          </div>
        </div>
      </section>
    );
  }
  if (error) {
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
      <div className="flex flex-col gap-2 p-4 text-justify h-fit rounded-lg">
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
