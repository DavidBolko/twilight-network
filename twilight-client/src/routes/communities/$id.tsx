import {createFileRoute, useLoaderData} from '@tanstack/react-router'
import axios from "axios";
import type {Community} from "../../types.ts";
import CreatePostModal from '../../components/CreatePostModal.tsx';
import {useState} from "react";


export const Route = createFileRoute('/communities/$id')({
    loader: async ({ params }) => {
        const res = await axios.get(`http://localhost:8080/api/c/${params.id}`);
        return res.data;
    },
    component: CommunityComponent,
});

function CommunityComponent() {
    const [isOpen, setIsOpen] = useState(false);
    const community: Community = useLoaderData({ from: Route.id });

    if(community) {
        return (
            <div className="relative">
                <CreatePostModal isOpen={isOpen} setIsOpen={setIsOpen} communityId={community.id}/>
                <h1>{community.name}</h1>
                <button onClick={()=>setIsOpen(true)} className="btn primary">Post</button>
                <img src={community.image} alt="haha"/>
            </div>
        );
    }
    return (
        <div>
            <p>Error</p>
        </div>
    );

}