import { FC, ReactNode } from "react";
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";
import { fetcher } from "./utils";
import { useQuery } from "react-query";

type data = {
  img: string;
};

const Layout: FC = () => {
  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/auth/user`),
    refetchOnWindowFocus: false,
  });

  if (data) {
    return (
      <>
        <Navbar img="default.svg" />
        <Outlet />
      </>
    );
  }
  return (
    <>
      <Navbar img="default.svg" />
      <Outlet />
    </>
  );
};

export default Layout;
