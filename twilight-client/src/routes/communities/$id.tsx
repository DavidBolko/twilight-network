import {createFileRoute, useLoaderData} from '@tanstack/react-router'
import axios from "axios";
import type {Community} from "../../types.ts";


export const Route = createFileRoute('/communities/$id')({
    loader: async ({ params }) => {
        const res = await axios.get(`http://localhost:8080/api/c/${params.id}`);
        return res.data;
    },
    component: CommunityComponent,
});

function CommunityComponent() {
    const community: Community = useLoaderData({ from: Route.id });

    if(community) {
        return (
            <div>
                <h1>{community.name}</h1>
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