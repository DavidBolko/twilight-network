import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import type {PostType} from "../types.ts";
import LikeButton from "./LikeButton.tsx";
import {useUser} from "../userContext.tsx";

export default function Post (props:PostType){
    let images;
    const currentUser = useUser();
    if(props.images){
        images = props.images.map((url) => ({
            original: url
        }));
    }
    return (
        <div className="card flex flex-col gap-2 p-2 w-full h-fit">
            <div className="flex gap-2 items-center">
                <img src="/pic.jpg" className="w-12 h-12 rounded-full" alt="community_photo" />
                <div>
                    <p className="font-semibold">{props.title}</p>
                    <p className="font-light text-sm text-gray-400">{props.community.name} by {props.author.name}</p>
                </div>
            </div>
            <div>
                {images && images.length > 0
                ? <ImageGallery items={images} showThumbnails={false} showBullets={true} showPlayButton={false} showFullscreenButton={false}/>
                : <textarea value={props.text} readOnly={true} className="border-none w-full text-sm text-white/70"/>
                }
            </div>
            <div>
                <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some(user => user.id === currentUser?.id) ?? false}/>
            </div>
        </div>
    );
}
