import { Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import LikeButton from "./LikeButton";
import { useUser } from "../userContext";
import type { PostType } from "../types";
import { getFromCdn } from "../utils";
import { DeleteButton } from "./DeleteButton";
import axios from "axios";
import { SaveButton } from "./SaveButton";

export default function Post(props: PostType) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUser();
  const { id: communityIdParam } = useParams({ strict: false }) as { id?: string };
  const isInCommunityPage = communityIdParam === props.communityId.toString();

  const match = location.pathname.startsWith("/post/");
  const canDelete = !!currentUser && (props.author.id === currentUser.id || currentUser.isElder);

  const deletePost = async () => {
    const form = new URLSearchParams();
    form.append("id", props.id);
    const result = await axios.delete(`${import.meta.env.VITE_API_URL}/p/${props.id}`, {
      withCredentials: true,
    });

    if (result.status === 200 && match) {
      navigate({ to: "/", search: { posts: "hot" } });
    }
  };
  return (
    <div className="container flex flex-col gap-2  w-full h-fit border-b hover:border-b-tw-accent border-white/15">
      <div className="flex gap-2 items-center">
        {!isInCommunityPage && <img src={props.communityImage ? getFromCdn(props.communityImage) : props.communityImage} className="w-12 h-12 rounded-full object-cover" alt="community_photo" />}
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
          <div>
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
          <textarea onClick={() => navigate({ to: "/post/$id", params: { id: props.id } })} value={props.text} readOnly={true} className="border-none cursor-pointer w-full text-md dark:text-white/70" />
        )}
      </div>

      <div className="flex justify-between ">
        <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some((user) => user.id === currentUser?.id) ?? false} />
        {match ? (
          <div>
            <DeleteButton
              isAuthor={canDelete}
              onConfirm={() => {
                deletePost();
              }}
            />
            <SaveButton postId={props.id} saved={props.saved} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
