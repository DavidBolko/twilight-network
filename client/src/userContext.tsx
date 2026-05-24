import { createContext, type ReactNode, useContext } from "react";
import { userSchema, type User } from "./types.ts";
import { useQuery } from "@tanstack/react-query";
import Loader from "./components/Loader.tsx";
import { api } from "./api.ts";

const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery<User | null>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await api.get("auth/me");
        return userSchema.parse(response);
      } catch {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading)
    return (
      <div className="mt-64">
        <Loader />
      </div>
    );

  return <UserContext.Provider value={data ?? null}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
