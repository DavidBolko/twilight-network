import { Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";

import LikeButton from "./LikeButton";
import { useUser } from "../userContext";
import type { PostType } from "../types";
import { getFromCdn } from "../utils";
import { DeleteButton } from "./DeleteButton";

import { SaveButton } from "./SaveButton";
import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";

import CreatePostContainer from "./CreatePostContainer";
import api from "../axios";

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
  const canEdit = !!currentUser && (props.author.id === currentUser.id || currentUser.isElder);

  const [isEditing, setIsEditing] = useState(false);

  // lokálny display state, aby sa UI okamžite zmenilo po uložení edit-u
  const [displayText, setDisplayText] = useState(props.text ?? "");
  const [displayImages, setDisplayImages] = useState<string[]>(props.images ?? []);

  // keď príde nový props (refetch), sync len ak práve needituješ
  useEffect(() => {
    if (isEditing) return;
    setDisplayText(props.text ?? "");
    setDisplayImages(props.images ?? []);
  }, [props.text, props.images, props.id, isEditing]);

  const hasImages = displayImages.length > 0;
  const hasText = !!displayText?.trim();
  const when = formatWhen((props as any).createdAt);

  const goToPost = () => navigate({ to: "/post/$id", params: { id: props.id } });

  const deletePost = async () => {
    const result = await api.delete(`${import.meta.env.VITE_API_URL}/p/${props.id}`, {
      withCredentials: true,
    });

    if (result.status === 200 && isPostPage) {
      navigate({ to: "/", search: { posts: "hot" } });
    }
  };

  return (
    <article className="container h-fit py-2 relative">
      {/* overlay link nech zostane – ale počas editu ho vypneme */}
      {!isEditing && <Link to="/post/$id" params={{ id: props.id }} aria-label={`Open post in ${props.communityName}`} className="absolute inset-0 rounded-md" />}

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
        {/* galéria zostáva rovnaká – ale počas editovania ju skryjeme (aby sa to nebilo s editorom) */}
        {!isEditing && hasImages && (
          <div className="rounded-lg overflow-hidden">
            <ImageGallery
              items={displayImages.map((id, i) => ({
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

        {(hasText || (isPostPage && isEditing)) && (
          <div onClick={(e) => e.stopPropagation()}>
            {isPostPage && isEditing ? (
              <CreatePostContainer
                communityId={props.communityId}
                postId={props.id}
                initialText={displayText}
                initialImageIds={displayImages}
                variant="inline"
                refetch={props.refetch}
                className="p-0 bg-transparent shadow-none border-none"
                onSaved={(updated) => {
                  setDisplayText(updated.text ?? "");
                  setDisplayImages(updated.images ?? []);
                  setIsEditing(false);
                  props.refetch?.();
                }}
                onCancel={() => {
                  setIsEditing(false);
                }}
              />
            ) : (
              <p className="text-md whitespace-pre-wrap break-words leading-relaxed">{displayText}</p>
            )}
          </div>
        )}

        {!hasImages && !hasText && !isEditing && <p className="text-sm text-white/50">Empty post</p>}
      </div>

      <div className="flex justify-between items-center relative z-10" onClick={(e) => e.stopPropagation()}>
        <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some((u) => u.id === currentUser?.id) ?? false} />

        {isPostPage ? (
          <div className="flex items-center gap-2 relative z-10">
            {canEdit && !isEditing && (
              <button
                type="button"
                className="hover:text-tw-primary"
                onClick={() => {
                  setIsEditing(true);
                }}
                aria-label="Edit post"
                title="Edit">
                <Pencil size={16} aria-hidden="true" />
              </button>
            )}

            {canEdit && isEditing ? (
              <button type="button" className="hover:text-tw-primary" onClick={() => setIsEditing(false)} aria-label="Cancel edit" title="Cancel">
                <X size={16} aria-hidden="true" />
              </button>
            ) : null}

            <DeleteButton isAuthor={canDelete} onConfirm={deletePost} />
            <SaveButton postId={props.id} saved={props.saved} />
          </div>
        ) : null}
      </div>
    </article>
  );
}
