import { createContext } from "react";

type user = {
  avatar: string,
  id: string,
  displayName: string,
  name: string
}

export const UserContext = createContext<user>({
  avatar: "default.svg",
  id: "",
  displayName: "",
  name: ""
});

const DarkMode = false;
export const ThemeContext = createContext<boolean>(DarkMode);