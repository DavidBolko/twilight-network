import { createContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { userSchema, type User } from "../types";
import { Loader } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<User | null>(null);

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

