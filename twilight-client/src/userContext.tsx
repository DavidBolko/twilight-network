import { createContext, type ReactNode, useContext } from "react";
import type { User } from "./types.ts";

import { useQuery } from "@tanstack/react-query";
import Loader from "./components/Loader.tsx";
import api from "./axios.ts";

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery<User>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await api.get<User>(`${import.meta.env.VITE_API_URL}/auth/me`, {
        withCredentials: true,
      });
      return res.data;
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <Loader />;

  return <UserContext.Provider value={data ?? null}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
