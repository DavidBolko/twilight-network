import { Link, useLocation, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Pencil, X } from "lucide-react";

import type { PostType } from "../types";
import { useUser } from "../userContext";
import { formatWhen, getFromCdn } from "../utils";
import api from "../axios";

import LikeButton from "./LikeButton";
import { DeleteButton } from "./DeleteButton";
import { SaveButton } from "./SaveButton";
import Gallery from "./Gallery";
import EditPost from "./EditPost";

type Props = PostType & {
  refetch?: () => void;
};

export default function Post(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useUser();
  const { id: communityIdParam } = useParams({ strict: false }) as { id?: string };

  const isPostPage = location.pathname.startsWith("/post/");
  const isInCommunityPage = communityIdParam === String(props.communityId);

  const canEdit = !!currentUser && (props.author.id === currentUser.id || currentUser.isElder);
  const canDelete = canEdit;

  const [editing, setEditing] = useState<boolean>(false);
  const [text, setText] = useState<string>(props.text ?? "");
  const [images, setImages] = useState<string[]>(props.images ?? []);

  useEffect(() => {
    if (editing) return;
    setText(props.text ?? "");
    setImages(props.images ?? []);
  }, [props.text, props.images, props.id, editing]);

  const when = useMemo(() => formatWhen(props.createdAt), [props]);
  const hasText = !!text.trim();
  const hasImages = images.length > 0;

  const goToPost = () => {
    if (isPostPage) return;
    navigate({ to: "/post/$id", params: { id: props.id } });
  };

  const deletePost = async () => {
    const res = await api.delete(`${import.meta.env.VITE_API_URL}/p/${props.id}`, { withCredentials: true });
    if (res.status === 200) {
      if (isPostPage) navigate({ to: "/", search: { posts: "hot", time:"week" } });
      props.refetch?.();
    }
  };

  console.log(props.images);
  
  return (
    <article className="panel cursor-pointer" onClick={goToPost} role="article" aria-label="Post">
      <header className="panel flex-row">
        {!isInCommunityPage ? <img src={props.communityImage ? getFromCdn(props.communityImage) : "/avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover " /> : null}

        <div>
          {!isInCommunityPage ? (
            <div>
              <Link onClick={(e) => e.stopPropagation()} to="/communities/$id" params={{ id: String(props.communityId) }} search={{ posts: "hot" }} className="font-semibold" >
                {props.communityName}
              </Link>

              <div className="text-xs text-tw-muted">
                <span>by </span>
                <Link onClick={(e) => e.stopPropagation()} to="/user/$id" params={{ id: props.author.id }}>
                  {props.author.name}
                </Link>
                {when ? <span className="ml-2">· {when}</span> : null}
              </div>
            </div>
          ) : (
            <div>
              <Link onClick={(e) => e.stopPropagation()} to="/user/$id" params={{ id: props.author.id }} className="font-semibold" >
                {props.author.name}
              </Link>
              {when ? <div className="text-xs opacity-70">{when}</div> : null}
            </div>
          )}
        </div>

        {/* EDIT/DELETE len na post page nie na feede */}
        {isPostPage ? (
          <div className="ml-auto" onClick={(e) => e.stopPropagation()}>
            {canEdit && !editing ? (
              <button type="button" className="btn muted" onClick={() => setEditing(true)} aria-label="Edit" title="Edit">
                <Pencil size={16} />
              </button>
            ) : null}

            {canEdit && editing ? (
              <button type="button" className="btn muted" onClick={() => setEditing(false)} aria-label="Cancel edit" title="Cancel">
                <X size={16} />
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      {/* content */}
      <div className="panel" >
        {!editing && hasImages ? <Gallery imageIds={images}  /> : null}

        {/* text alebo editor pokial sa edituje */}
        {isPostPage && editing ? (
          <EditPost
            postId={props.id}
            initialText={text}
            initialImageIds={images}
            onSaved={(updated) => {
              setText(updated.text ?? "");
              setImages(updated.images ?? []);
              setEditing(false);
              props.refetch?.();
            }}
            onCancel={() => setEditing(false)}
          />
        ) : hasText ? (
          <p className="text-justify break-words">{text}</p>
        ) : (
          <p className="text-sm opacity-70">Empty post</p>
        )}
      </div>

      <footer className="panel flex-row justify-between">
        <LikeButton id={props.id} count={props.likes?.length ?? 0} filled={props.likes?.some((u) => u.id === currentUser?.id) ?? false} />
        <div>
          <DeleteButton isAuthor={!!canDelete} onConfirm={deletePost} />
          <SaveButton postId={props.id} saved={props.saved} />
        </div>
      </footer>
    </article>
  );
}
