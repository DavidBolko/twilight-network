import { Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import type { PostType } from "../types";
import { formatWhen, getFromCdn } from "../utils";
import { api } from "../api";

import LikeButton from "./LikeButton";
import { DeleteButton } from "./DeleteButton";
import { SaveButton } from "./SaveButton";
import Gallery from "./Gallery";
import { useUser } from "../hooks";

type Props = PostType & {
  refetch?: () => void;
};

export default function Post(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUser();
  const queryClient = useQueryClient();

  const { id: routeId } = useParams({ strict: false }) as { id?: string };

  const isPostPage = location.pathname.startsWith("/post/");
  const isCommunityPage = location.pathname.startsWith("/communities/");

  const isInCommunityPage = !!props.community && isCommunityPage && routeId === String(props.community.id);
  const showCommunity = !!props.community && !isInCommunityPage;
  const canEdit = !!currentUser && (props.author.id === currentUser.id || currentUser.isElderOwl);

  const title = props.title ?? "";
  const text = props.text ?? "";
  const images = props.images ?? [];

  const hasTitle = title.trim().length > 0;
  const hasText = text.trim().length > 0;
  const hasImages = images.length > 0;

  const when = useMemo(() => formatWhen(props.createdAt), [props.createdAt]);

  const avatarSrc = showCommunity ? (props.community?.image ? getFromCdn(props.community.image) : "/avatar.png") : props.author.avatar ? getFromCdn(props.author.avatar) : "/avatar.png";

  const goToPost = () => {
    if (isPostPage) return;
    navigate({ to: "/post/$id", params: { id: String(props.id) } });
  };

  const deletePost = async (): Promise<void> => {
    await api.delete(`posts/${props.id}`);
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey[0];
        return typeof key === "string" && key.includes("post");
      },
    });
    props.refetch?.();
    if (isPostPage) navigate({ to: "/", search: { posts: "hot", time: "all" } });
  };

  return (
    <article className={`card flex-col rounded-none border-none p-4 ${!isPostPage ? "card-interactive" : ""}`} onClick={goToPost}>
      {/* Header */}
      <header className="flex items-center gap-3">
        <img src={avatarSrc} alt="" className="avatar size-10 shrink-0" />

        <div className="flex flex-col leading-tight overflow-hidden">
          {showCommunity && props.community ? (
            <Link to="/communities/$id" params={{ id: String(props.community.id) }} search={{ posts: "hot", time: "all" }} className="font-bold text-[15px] hover:underline truncate">
              {props.community.name}
            </Link>
          ) : (
            <Link to="/user/$id" params={{ id: props.author.id }} search={{ tab: "Posts" }} className="font-bold text-[15px] hover:underline truncate">
              {props.author.userName}
            </Link>
          )}

          <div className="flex items-center gap-1 text-[13px] text-tw-muted">
            {showCommunity && (
              <>
                <Link to="/user/$id" params={{ id: props.author.id }} search={{ tab: "Posts" }} className="hover:underline">
                  u/{props.author.userName}
                </Link>
                <span>·</span>
              </>
            )}
            <span>{when}</span>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-col gap-2">
        {hasTitle && <h2 className="text-xl font-extrabold tracking-tight leading-snug">{title}</h2>}
        {hasText && <p className="text-base text-tw-light-text dark:text-tw-text/90 whitespace-pre-wrap break-words text-justify">{text}</p>}
        {hasImages && (
          <div className="rounded-xl overflow-hidden border border-tw-light-border dark:border-tw-border mt-1">
            <Gallery images={images} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex items-center justify-between -ml-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-6">
          <LikeButton id={props.id} count={props.likesCount} filled={props.isLiked} />
        </div>
        <div className="flex items-center">
          <SaveButton postId={props.id} saved={props.isSaved} />
          <DeleteButton isAuthor={canEdit} onConfirm={deletePost} />
        </div>
      </footer>
    </article>
  );
}
