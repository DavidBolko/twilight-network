import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { Index } from './Index'
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Auth } from './auth';
import { QueryClient, QueryClientProvider } from 'react-query';
import CreateCommunity from './routes/community/CreateCommunity';
import Community from './routes/community/Community';
import ErrorPage from './routes/ErrorPage';
import CreatePost from './routes/post/CreatePost';


const queryClient = new QueryClient()


const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    
  },
  {
    path: "/auth",
    element: <Auth/>
  },
  {
    path: "/p",
    children:[
      {
        path: "create",
        element: <CreatePost/>
      }
    ],
  },
  {
    path: "/c",
    children:[
      {
        path:"create",
        element: <CreateCommunity/>
      },
      {
        path: ":cName",
        element: <Community/>
      }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <QueryClientProvider client={queryClient}>
    <RouterProvider router={router} />
  </QueryClientProvider>
);