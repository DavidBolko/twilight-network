import { createFileRoute, useParams } from "@tanstack/react-router";
import Post from "../../components/Post.tsx";
import { SendIcon } from "lucide-react";
import axios from "axios";
import type { PostType } from "../../types.ts";
import { type SyntheticEvent, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/post/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = useParams({ from: Route.id });
  const queryClient = useQueryClient();
  const [comment, setComment] = useState("");

  const { data } = useQuery<PostType>({
    queryKey: ["post", id],
    queryFn: () =>
      axios
        .get(`${import.meta.env.VITE_API_URL}/p/${id}`, {
          withCredentials: true,
        })
        .then((res) => res.data),
  });

  const sendComment = async (e: SyntheticEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("comment", comment);

    const result = await axios.post(`${import.meta.env.VITE_API_URL}/p/${id}/comment`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (result.status === 200) {
      await queryClient.invalidateQueries({ queryKey: ["post", id] });
      setComment("");
    }
  };

  if (data && data.comments !== undefined) {
    return (
      <div className="resp-grid  p-2">
        <div className="card flex flex-col gap-1 col-start-2">
          <Post text={data.text} author={data.author} id={data.id} title={data.title} communityImage={data.communityImage} communityName={data.communityName} communityId={data.communityId} images={data.images} likes={data.likes} />
          <div className="container flex-col">
            <p>Comments</p>
            <form onSubmit={(e) => sendComment(e)} className="flex flex-col gap-2">
              <textarea required onChange={(e) => setComment(e.target.value)} className="w-full resize-none h-[80px] outline-none border-b-2 border-stone-700/20" />
              <button type="submit" className="btn primary flex items-center self-end">
                Submit
                <SendIcon className="w-4 h-4" />
              </button>
            </form>
            <ul className="flex flex-col mt-2 gap-4">
              {data.comments.map((comment) => (
                <li key={comment.id}>
                  <div className="container flex-col">
                    <div className="flex items-center">
                      <img src="/anonymous.png" className="rounded-full w-8 h-8" />
                      <p>{comment.author.name}</p>
                    </div>
                    <p className="text-md text-justify ml-2">{comment.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }
  return <div className="resp-grid p-2"></div>;
}
