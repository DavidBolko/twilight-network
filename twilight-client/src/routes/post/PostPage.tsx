import { FC, useState } from "react";
import { useQuery } from "react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CDN, fetcher } from "../../utils";
import { ChatBubbleOvalLeftIcon, HandThumbUpIcon as LikeSolid } from "@heroicons/react/24/solid";
import { FaceSmileIcon, HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import Comment from "../../components/Comment";
import { Users } from "@phosphor-icons/react";

type comment = [
  {
    content: string;
    author: User;
  }
];

type User = {
  displayName: string;
  img: string;
};

type Community = {
  displayName: string;
  name: string;
};

type data = {
  title: string;
  type: string;
  content: string;
  author: User;
  comments: comment;
  community: Community;
  comID: string;
};

const PostPage: FC = () => {
  const navigate = useNavigate()
  const [comment, setComment] = useState("");

  const params = useParams();
  console.log(`/api/p/${params.id}`);
  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/p/${params.id}`),
    refetchOnWindowFocus: false,
  });

  const submitComment = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    console.log(comment);

    if (comment.length > 0) {
      const res = await fetch("/api/p/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment, id: params.id }),
      });
      if (res.ok) {
        refetch();
      }
    }
  };

  if (data?.type == "picture") {
    console.log(data);

    return (
      <main className="flex flex-col gap-2 p-4 pt-16 mr-auto ml-auto max-w-[900px] lg:col-start-2">
        <section className="card">
          <div className="flex items-center gap-2">
            <img src={CDN("898dde0c5e4360f80d790a1a92c18503.jpg")} className="w-12 h-12 rounded-full object-cover" />
            <div className="w-full">
              <p className="font-bold">{data.title}</p>
              <p className="text-xs">{"by " + data.author.displayName}</p>
            </div>
            <a href="" onClick={()=>navigate(`/c/${data.community.name}`)} className="flex items-center self-end text-xs font-normal dark:text-twilight-300 hover:text-moonlight-300 ml-auto">
              <Users width={20} height={20}/>
              {data.community.displayName}
            </a>
          </div>
          <img src={CDN(data.content)} alt="" loading="lazy" className="rounded-lg mb-4 mt-2" />
          <div className="flex w-full">
            <LikeOutline width={24} />
            <div className="flex ml-auto items-center">
              <ChatBubbleOvalLeftIcon width={24} />
              <p className="text-sm">{data.comments.length}</p>
            </div>
          </div>
        </section>
        <section className="card">
          <div>
            <p>Comment</p>
            <form className="flex flex-col">
              <textarea
                className="w-full p-2 rounded-md resize-none form-input outline-none shadow-twilight "
                onChange={(e) => setComment(e.target.value)}
                placeholder="Leave a comment..."
                name=""
                id=""
              />
              <div className="flex items-center mt-2">
                <FaceSmileIcon width={32} />
                <input className="ml-auto button-colored" required={true} type="submit" name="" id="" onClick={submitComment} />
              </div>
            </form>
          </div>
          <p>Comments</p>
          <ul className="flex flex-col-reverse">
            {data.comments?.map((ele) => (
              <Comment author={ele.author} content={ele.content} />
            ))}
          </ul>
        </section>
      </main>
    );
  }
  return (
    <main className="flex p-4 pt-20 mr-auto ml-auto max-w-[800px] lg:col-start-2">
      <img></img>
    </main>
  );
};

export default PostPage;
