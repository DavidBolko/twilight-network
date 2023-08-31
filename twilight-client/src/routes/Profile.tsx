import { useContext } from "react";
import { useSearchParams } from "react-router-dom";
import UserCard from "../components/Profile/UserCard";
import { UserContext } from "../store";
import Tabs from "../components/Profile/Tabs";

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = searchParams.get("user")!;
  const _user = useContext(UserContext);

  return (
    <main className="flex flex-col gap-2 p-6 mr-auto ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
      <UserCard displayName={_user.displayName} avatar={_user.avatar} logged={true} desc={"Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente ratione molestias asperiores eveniet et, id esse fugiat omnis. Voluptatum officia aperiam aut ea ex veritatis. Ipsum quaerat velit eveniet reprehenderit."}/>
      <section>
        <Tabs user={"dsds"}/>
      </section>
    </main>
  );
};


export default Profile;
