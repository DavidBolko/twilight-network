export type Community = {
    id:string,
    name: string,
    image: string,
}

export type Post = {
    id:string,
    title: string,
    text: string,
    community_id: Community,
}