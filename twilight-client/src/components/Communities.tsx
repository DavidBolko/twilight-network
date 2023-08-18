import CommunityCard from "./CommunityCard"

const Communities = () =>{
    return(
        <ul className="flex flex-col gap-2">
            <CommunityCard/>
            <CommunityCard/>
            <CommunityCard/>
            <CommunityCard/>
        </ul>
    )
}

export default Communities