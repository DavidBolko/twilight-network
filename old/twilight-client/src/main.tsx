import { StrictMode, useLayoutEffect, useState} from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { Index } from "./Index";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { Auth } from "./auth";
import { QueryClient, QueryClientProvider } from "react-query";
import CreateCommunity from "./routes/community/CreateCommunity";
import Community from "./routes/community/Community";
import CreatePost from "./routes/post/CreatePost";
import PostPage from "./routes/post/PostPage";
import Layout from "./Layout";
import Profile from "./routes/Profile";
import { ThemeContext } from "./store";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout/>,
    children:[
      {
        path: "",
        element: <Index />
      }
    ]
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/p",
    element: <Layout />,
    children: [
      {
        path: ":id",
        element: <PostPage />,
      },
    ],
  },
  {
    path: "/profile/:id",
    element: <Layout/>,
    children: [
      {
        path: "",
        element: <Profile/>,
      },
    ],
  },
  {
    path: "/c",
    element: <Layout />,
    children: [
      {
        path: "create",
        element: <CreateCommunity />,
      },
      {
        path: ":id",
        element: <Community />,
      },
      {
        path: ":id/create",
        element: <CreatePost/>,
      },
    ],
  },
]);

const preferDarkSchema = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
const defaultTheme = preferDarkSchema ? "true" : "false"


const App = () =>{
  const [theme, setTheme] = useState(localStorage.getItem('darkMode') || defaultTheme)

  useLayoutEffect(() => {
    const root = document.getElementById("document")
    if(theme == "true"){
      root?.classList.add("dark")
    }
    else{
      root?.classList.remove("dark")
    }
  }, [theme])

  return(
    <StrictMode>
      <ThemeContext.Provider value={[theme, setTheme]}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </ThemeContext.Provider>
    </StrictMode>
  )
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <App/>
);
