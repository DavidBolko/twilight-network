import { useQuery } from "react-query"
import CommunityCard from "../CommunityCard"
import axios from "axios"
import { FC } from "react"

type props={
    userID:string
}

const Communities:FC<props> = (props) =>{
    const {data, refetch} = useQuery<response>("followedCommunities", async ()=> await axios.get(`/api/c?followedBy=${props.userID}`).then((res) => res.data), {refetchOnWindowFocus:false})
    if(data){
        return(
            <ul className="flex flex-col gap-2">
                {data.map((ele) => (
                    <li><CommunityCard Img={ele.Img} desc={ele.desc} moderator={ele.moderator} name={ele.name} id={ele.id}/></li>
                ))}
            </ul>
        )
    }
    return(
        <ul className="flex flex-col gap-2">

        </ul>
    )
}   

export default Communities

type response = [{
    id:string,
    name:string,
    desc:string,
    Img:string,
    moderator:boolean
}]