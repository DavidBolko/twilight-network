import { FC, useEffect } from "react";
import Navbar from "./components/Navbar/Navbar";
import { Outlet } from "react-router-dom";
import { useQuery } from "react-query";
import { UserContext } from "./store";
import axios from "axios";
import useTheme from "./hooks/darkMode";
import Loader from "./components/elements/Loader";

const Layout: FC = () => {
  const {data, status, isLoading} = useQuery<response>("authData", {queryFn: () => axios.get(`/api/auth/user`), retry:false, refetchOnWindowFocus:false})

  if(isLoading){
    return(
      <div className="grid place-items-center h-screen">
        <Loader/>
      </div>
    )
  }
  else if (data){
    return (
      <UserContext.Provider value={data.data}>
        <Navbar/>
        <Outlet />
      </UserContext.Provider>
    );
  }
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default Layout;


type response = {
  data:{
    avatar: string,
    id: string,
    name:string,
    displayName: string,
    logged:boolean
  }
}
