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

function formatWhen(createdAt?: string) {
  if (!createdAt) return "";
  const d = new Date(createdAt);
  if (Number.isNaN(d.getTime())) return "";

  const diffMs = Date.now() - d.getTime();
  const sec = Math.floor(diffMs / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);

  if (sec < 60) return `${sec}s`;
  if (min < 60) return `${min}m`;
  if (hr < 24) return `${hr}h`;
  if (day < 7) return `${day}d`;

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(d);
}

export default function Post(props: PostType) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUser();
  const { id: communityIdParam } = useParams({ strict: false }) as { id?: string };

  const isInCommunityPage = communityIdParam === props.communityId.toString();
  const isPostPage = location.pathname.startsWith("/post/");
  const canDelete = !!currentUser && (props.author.id === currentUser.id || currentUser.isElder);

  const goToPost = () => navigate({ to: "/post/$id", params: { id: props.id } });

  const deletePost = async () => {
    const result = await axios.delete(`${import.meta.env.VITE_API_URL}/p/${props.id}`, {
      withCredentials: true,
    });

    if (result.status === 200 && isPostPage) {
      navigate({ to: "/", search: { posts: "hot" } });
    }
  };

  const hasImages = !!props.images?.length;
  const hasText = !!props.text?.trim();
  const when = formatWhen((props as any).createdAt);

  return (
    <article className="container m-1 h-fit py-2 relative">
      <Link to="/post/$id" params={{ id: props.id }} aria-label={`Open post in ${props.communityName}`} className="absolute inset-0 rounded-md" />

      <div className="container p-0 items-center flex-row relative z-10">
        {!isInCommunityPage && <img src={props.communityImage ? getFromCdn(props.communityImage) : props.communityImage} className="w-10 h-10 rounded-full object-cover" alt={`${props.communityName} avatar`} />}

        <div className="min-w-0">
          {!isInCommunityPage ? (
            <div className="flex flex-col min-w-0">
              <div className="min-w-0">
                <Link search={{ posts: "hot" }} to="/communities/$id" params={{ id: props.communityId.toString() }} className="font-semibold truncate hover:text-white/90 relative z-10" onClick={(e) => e.stopPropagation()}>
                  {props.communityName}
                </Link>

                {when && (props as any).createdAt && (
                  <time className="text-xs ml-2 text-white/45" dateTime={(props as any).createdAt}>
                    · {when}
                  </time>
                )}
              </div>

              <p className="font-light text-sm text-gray-400 truncate">
                <span>by </span>
                <Link to="/user/$id" params={{ id: props.author.id }} className="hover:text-white/80 relative z-10" onClick={(e) => e.stopPropagation()}>
                  {props.author.name}
                </Link>
              </p>
            </div>
          ) : (
            <div className="flex flex-col leading-tight min-w-0">
              <Link to="/user/$id" params={{ id: props.author.id }} className="font-semibold text-white/80 hover:text-white/95 truncate relative z-10" onClick={(e) => e.stopPropagation()}>
                {props.author.name}
              </Link>

              {when && (props as any).createdAt && (
                <time className="text-xs text-white/45" dateTime={(props as any).createdAt}>
                  {when}
                </time>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 relative z-10">
        {hasImages && (
          <div className="rounded-lg overflow-hidden">
            <ImageGallery
              items={props.images!.map((id, i) => ({
                original: getFromCdn(id),
                originalAlt: `Post image ${i + 1}`,
              }))}
              showThumbnails={false}
              showBullets={true}
              showPlayButton={false}
              showFullscreenButton={false}
              onClick={(e: any) => {
                e?.stopPropagation?.();
                goToPost();
              }}
            />
          </div>
        )}

        {hasText && (
          <div>
            <p className="text-md  whitespace-pre-wrap break-words leading-relaxed">{props.text}</p>
          </div>
        )}

        {!hasImages && !hasText && <p className="text-sm text-white/50">Empty post</p>}
      </div>

      <div className="flex justify-between items-center relative z-10" onClick={(e) => e.stopPropagation()}>
        <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some((u) => u.id === currentUser?.id) ?? false} />

        {isPostPage ? (
          <div className="flex items-center gap-2 relative z-10">
            <DeleteButton isAuthor={canDelete} onConfirm={deletePost} />
            <SaveButton postId={props.id} saved={props.saved} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
