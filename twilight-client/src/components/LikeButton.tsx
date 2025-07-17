import {useState} from "react";
import {HeartIcon} from "lucide-react";
import axios from "axios";

type props = {
    filled: boolean,
    count: number,
    id: string
}

export default function LikeButton(props: props) {
    const [filled, setFilled] = useState(props.filled);
    const [count, setCount] = useState(props.count);
    const setLike = async() => {
        const result = await axios.put(`http://localhost:8080/api/p/${props.id}/like`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer tvoj_token_tu"
                }
            }
        );

        if(result.status === 200){
            setFilled(!filled);
            if(filled){
                setCount(count - 1);
            } else setCount(count + 1);
        }
    }

    return(
        <div className="flex gap-1 text-sm">
            <button onClick={()=>setLike()} className="flex items-center self-end hover:cursor-pointer">
                {filled
                ? <HeartIcon fill="white" className="w-5 h-5 hover:"/>
                : <HeartIcon className="w-5 h-5"/>
                }
            </button>
            <p>{count} likes</p>
        </div>
    )
}