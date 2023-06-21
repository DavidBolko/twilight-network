import { MagnifyingGlassIcon, UserCircleIcon } from "@heroicons/react/24/outline"
import { Sidebar } from "./components/Sidebar"
import Navbar from "./components/Navbar"
import PostCard from "./components/PostCard"


export const Index = () =>{
  return(
    <>
      <Navbar/>
      <section className="flex p-4 pt-20 mr-auto ml-auto max-w-[800px] lg:col-start-2">
        <ul className="flex flex-col gap-6">
          <PostCard/>
          <PostCard/>
          <PostCard/>
          <PostCard/>
        </ul>
      </section>
    </>
  )
}