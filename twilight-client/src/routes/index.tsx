import { createFileRoute } from '@tanstack/react-router'
import {queryClient} from "../main.tsx";
import axios from "axios";
import {useQuery} from "@tanstack/react-query";
import type {PostType} from "../types.ts";
import Post from "../components/Post.tsx";

const fetchPosts = async () => {
    const res = await axios.get('http://localhost:8080/api/p', {
        withCredentials: true,
    })
    return res.data
}

export const Route = createFileRoute('/')({
    loader: async () => {
        await queryClient.ensureQueryData({
            queryKey: ['posts'],
            queryFn: fetchPosts,
        })
    },
    component: Index,
})

function Index() {
    const { data, isLoading, error } = useQuery<PostType[]>({
        queryKey: ['posts'],
        queryFn: fetchPosts,
    })

    if (isLoading) return <p>Loading...</p>
    if (error) return <p>Error loading posts</p>

    return (
        <div className="resp-grid p-2 gap-2">
            <h1 className="col-start-2">Welcome back!</h1>
            <ul className="flex flex-col gap-1 col-start-2">
                {data?.map((post) => (
                    <li key={post.id}>
                        <Post text={post.title} id={post.id} title={post.title} likes={post.likes} author={post.author} community={post.community} images={post.images} comments={post.comments}/>
                    </li>
                ))}
            </ul>
        </div>
    )
}