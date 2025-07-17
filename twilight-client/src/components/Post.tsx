import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import type {PostType} from "../types.ts";
import LikeButton from "./LikeButton.tsx";

export default function Post (props:PostType){
    let images;
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
                    <p className="font-light text-sm text-gray-400">{props.community.name} by [user]</p>
                </div>
            </div>
            <div>
                {images
                ? <ImageGallery items={images} showThumbnails={false} showBullets={true} showPlayButton={false} showFullscreenButton={false}/>
                : <textarea/>
                }
            </div>
            <div>
                <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some(user => user.id === "aec09d67-43bc-4e66-a311-05561f678102") ?? false}/>
            </div>
        </div>
    );
}
