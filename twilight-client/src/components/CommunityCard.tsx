import { CDN } from "../utils"

const CommunityCard = () =>{
    return(
        <li className="card flex-row">
            <img src={CDN("default.svg")} className="h-32 w-32 border border-twilight-dark-500 rounded-full"/>
            <div className="flex flex-col gap-2 text-justify">
                <p className="mt-2">Witcher</p>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugiat, ab sequi sunt ex explicabo aut commodi eveniet at molestiae inventore dolor placeat et!</p>
            </div>
            <button className="button-colored h-fit self-center">Follow</button>
        </li>
    )
}

export default CommunityCard