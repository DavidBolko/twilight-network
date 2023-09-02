import { StrictMode, useContext} from "react";
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
const theme = useContext(ThemeContext)

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
        path: "create",
        element: <CreatePost />,
      },
      {
        path: ":id",
        element: <PostPage />,
      },
    ],
  },
  {
    path: "/profile",
    element: <Layout />,
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
        path: ":name",
        element: <Community />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeContext.Provider value={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ThemeContext.Provider>
  </StrictMode>
);
