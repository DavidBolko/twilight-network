import { createContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api";
import { currentUserSchema, type CurrentUser } from "../types";
import { Loader } from "lucide-react";

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const { data, isLoading } = useQuery<CurrentUser | null>({
    queryKey: ["currentUser"],

    queryFn: async () => {
      try {
        const response = await api.get("users/me");

        return currentUserSchema.parse(response);
      } catch (error) {
        console.error("Failed to load current user:", error);
        return null;
      }
    },

    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="mt-64">
        <Loader />
      </div>
    );
  }

  return (
    <UserContext.Provider value={data ?? null}>
      {children}
    </UserContext.Provider>
  );
}