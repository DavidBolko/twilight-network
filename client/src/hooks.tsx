import { useEffect, useState, type RefObject } from "react";

export function useDebounce(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}

export function useThemeToggler() {
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

export function useInfiniteScroll(_ref:RefObject<null> ,fetchNextPage: VoidFunction, hasNextPage:boolean, isFetchingNextPage: boolean) {
  useEffect(() => {
    const ref = _ref.current;
    if (!ref) return;
    const scrollCallback = ([entry]: IntersectionObserverEntry[]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    const observer = new IntersectionObserver(scrollCallback, { rootMargin: "600px" });
    observer.observe(ref);
    return () => {
      observer.disconnect();
    };
  }, [_ref, hasNextPage, isFetchingNextPage, fetchNextPage]);
}
