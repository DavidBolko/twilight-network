import { useEffect, useState } from "react";

export function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}


export function useThemeToggler(){
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("dark_mode") === "1";
    setDark(saved);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark_mode", dark ? "1" : "0");
  }, [dark]);

  const toggle = () => setDark((prev) => !prev);

  return { dark, setDark, toggle };
}