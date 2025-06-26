import { createContext } from "react";

type user = {
  avatar: string,
  id: string,
  name: string
}

export const UserContext = createContext<user>({
  avatar: "default.svg",
  id: "",
  name: ""
});

type theme = [
  darkMode: string,
  setTheme: Function
]
export const ThemeContext = createContext<theme>(["true", ()=>{}]);