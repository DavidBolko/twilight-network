import { FC } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";
import { UserContext } from "./store";
import axios from "axios";

type response = {
  data:{
    avatar: string,
    id: string,
    displayName: string,
    logged:boolean
  }
}

const Layout: FC = () => {
  const {data} = useQuery<response>("authData", {queryFn: () => axios.get(`/api/auth/user`), retry:false, refetchOnWindowFocus:false})

  if (data) {
    return (
      <div>
        <UserContext.Provider value={data.data}>
          <div>
            <Navbar/>
            <Outlet />
          </div>
        </UserContext.Provider>
      </div>
    );
  }
  return (
    <>
      <Navbar/>
      <Outlet />
    </>
  );
};

export default Layout;
