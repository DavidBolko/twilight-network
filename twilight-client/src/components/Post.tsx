import { Link, useNavigate, useParams } from "@tanstack/react-router";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import LikeButton from "./LikeButton";
import { useUser } from "../userContext";
import type { PostType } from "../types";
import { getFromCdn } from "../globals";

export default function Post(props: PostType) {
  const navigate = useNavigate();
  const currentUser = useUser();
  const { id: communityIdParam } = useParams({ strict: false }) as { id?: string };
  const isInCommunityPage = communityIdParam === props.communityId.toString();

  return (
    <div className="container flex flex-col gap-2  w-full h-fit border-b border-white/15">
      <div className="flex gap-2 items-center">
        {!isInCommunityPage && <img src={getFromCdn(props.communityImage)} className="w-12 h-12 rounded-full object-cover" alt="community_photo" />}
        <div>
          <p className="font-semibold">{props.title}</p>
          <p className="font-light text-sm text-gray-400">
            {!isInCommunityPage && (
              <Link search={{ posts: "hot" }} to="/communities/$id" params={{ id: props.communityId.toString() }}>
                {props.communityName}
              </Link>
            )}{" "}
            by{" "}
            <Link to="/user/$id" params={{ id: props.author.id }}>
              {props.author.name}
            </Link>
          </p>
        </div>
      </div>

      <div>
        {props.images && props.images.length > 0 ? (
          <div className="ignore-link">
            <ImageGallery
              items={props.images.map((id) => ({
                original: getFromCdn(id),
              }))}
              showThumbnails={false}
              showBullets={true}
              showPlayButton={false}
              showFullscreenButton={false}
              onClick={() => navigate({ to: "/post/$id", params: { id: props.id } })}
            />
          </div>
        ) : (
          <textarea value={props.text} readOnly={true} className="border-none w-full text-md dark:text-white/70" />
        )}
      </div>

      <div>
        <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some((user) => user.id === currentUser?.id) ?? false} />
      </div>
    </div>
  );
}
