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

    const setLike = async () => {
        try {
            const response = await axios.put(
                `http://localhost:8080/api/p/${props.id}/like`, {},
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                }
            );

            if (response.status === 200) {
                setFilled(!filled);
                setCount(prev => filled ? prev - 1 : prev + 1);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    window.location.href = "/auth/login";
                }
            } else {
                console.error("Unexpected error", error);
            }
        }
    };

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