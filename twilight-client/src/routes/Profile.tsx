import { useContext } from "react";
import { useLocation, useNavigate} from "react-router-dom";
import UserCard from "../components/Profile/UserCard";
import { UserContext } from "../store";
import Tabs from "../components/Profile/Tabs";
import { useQuery } from "react-query";
import axios from "axios";
import UserCardSkeleton from "../components/Skeletons/UserCardSkeleton";
import TabsSkeleton from "../components/Skeletons/TabsSkeleton";



const Profile = () => {
  const location = useLocation()
  const id = location.pathname.split("/")[2]
  const existingSession = useContext(UserContext);

  const {data, refetch} = useQuery<user>("user", async ()=> await axios.get(`/api/user/${id}`).then((res) => res.data), {refetchOnWindowFocus:false})

  return (
    <main className="flex flex-col gap-2 p-6 mr-auto ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
      {data 
      ? <UserCard user={data} logged={existingSession.id == id} refetch={refetch}/>
      : <UserCardSkeleton/>
      }
      <section>
      {data 
      ? <Tabs userID={id}/>
      : <TabsSkeleton/>
      }
      </section>
    </main>
  );
};


export default Profile;

export type user = {
  avatar: string
  name: string
  id: string;
  description: string;
}
