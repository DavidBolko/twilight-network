import { createContext } from "react";

type user = {
  avatar: string,
  id: string,
  displayName: string
}

export const UserContext = createContext<user>({
  avatar: "default.svg",
  id: "",
  displayName: ""
});