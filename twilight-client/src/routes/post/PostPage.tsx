import { FC, useState } from "react";
import { useQuery } from "react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CDN, fetcher } from "../../utils";
import { ChatBubbleOvalLeftIcon, HandThumbUpIcon as LikeSolid } from "@heroicons/react/24/solid";
import { FaceSmileIcon, HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import Comment from "../../components/Comment";
import { Users } from "@phosphor-icons/react";
import PostCard from "../../components/PostCard";

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
        setComment("")
        refetch();
      }
    }
  };

  if (data) {
    return (
      <main className="flex flex-col gap-2 p-4 pt-16 mr-auto ml-auto max-w-[750px] lg:col-start-2">
        <section>
          <PostCard author={data.author} title={data.title} type={data.type} community={data.community} cardType="" comments={data.comments.length} content={data.content} likeCount={data.likedBy.length} id={data.id} refetch={refetch} />
        </section>
        <section className="card">
          <div>
            <p>Comment</p>
            <form className="flex flex-col">
              <textarea
                className="w-full p-2 rounded-md resize-none form-input outline-none shadow-twilight "
                onChange={(e) => setComment(e.target.value)}
                value={comment}
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
              <li>
                <Comment author={ele.author} content={ele.content} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }
};

export default PostPage;


type data = {
  author: {
    displayName: string;
  };
  comments: [
    {
      content: string,
      author: {
        displayName: string
        img: string
      }
    }
  ];
  community: {
    displayName: string;
    id: string;
    Img: string;
  };
  content: string;
  type: string;
  id: string;
  likedBy:[{
    displayName: string,
    avatar: string,
    id:string
  }]
  title: string;
  userId: string;
  liked:boolean
};