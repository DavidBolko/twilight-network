export type Community = {
    id:string,
    name: string,
    imageUrl: string,
}
export type User = {
    id: string,
    name: string,
}
export type Comment = {
    id: number,
    content: string,
    author: User,
}
export type PostType = {
    id:string,
    title: string,
    text: string,
    community: Community,
    author: User,
    images?: string[],
    likes: User[],
    comments?: Comment[],

}