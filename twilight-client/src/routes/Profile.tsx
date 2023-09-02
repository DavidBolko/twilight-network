import { useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import UserCard from "../components/Profile/UserCard";
import { UserContext } from "../store";
import Tabs from "../components/Profile/Tabs";
import { useQuery } from "react-query";
import axios from "axios";
import PostCardSkeleton from "../components/Skeletons/PostCardSkeleton";



const Profile = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const user = searchParams.get("name")!;
  const existingSession = useContext(UserContext);

    console.log(existingSession.id);
    
  let _user
  if(existingSession.id){
    console.log(existingSession);
    
    const {data} = useQuery<response>("user", {queryFn: async() => await axios.get(`/api/user/${existingSession.name}`), retry:false})
    _user = data
  }
  else{
    if(!user){
      navigate("/auth")
    }
    const {data} = useQuery<response>("user", {queryFn: async() => await axios.get(`/api/user/${user.toString()}`)})
    _user = data
  }
  
  console.log(_user);
  if(_user){
    return (
      <main className="flex flex-col gap-2 p-6 mr-auto ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
        <UserCard displayName={_user!.data.displayName} avatar={_user!.data.avatar} logged={true} desc={"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente ratione molestias asperiores eveniet et, id esse fugiat omnis. Voluptatum officia aperiam aut ea ex veritatis. Ipsum quaerat velit eveniet reprehenderit."}/>
        <section>
          <Tabs user={"dsds"}/>
        </section>
      </main>
    );
  }
  return (
    <main className="flex flex-col gap-2 p-6 mr-auto pt-16 ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
      <PostCardSkeleton/>
      <section>
        <Tabs user={"dsds"}/>
      </section>
    </main>
  );
};


export default Profile;


type response = {
  data:{
    id: string
    name: string
    displayName: string
    email: string
    password: string
    avatar: string
    description: any
    Posts: Array<{
      community: {
        name: string
        displayName: string
      }
      likedBy: Array<any>
      id: string
      title: string
      content: string
      type: string
      _count: {
        comments: number
      }
    }>
    Followed: Array<{
      id: string
      name: string
      displayName: string
      desc: string
      Img: string
    }>
  }
}