import { FC, useContext, useState } from "react";
import { useQuery } from "react-query";
import { useNavigate, useParams } from "react-router-dom";
import { FaceSmileIcon, HandThumbUpIcon as LikeOutline } from "@heroicons/react/24/outline";
import Comment from "../../components/Comment";
import PostCard from "../../components/PostCard";
import PostCardSkeleton from "../../components/Skeletons/PostCardSkeleton";
import { UserContext } from "../../store";
import axios from "axios";
import { Smile } from "lucide-react";

const PostPage: FC = () => {
  const navigate = useNavigate()
  const [comment, setComment] = useState("");

  const params = useParams();
  console.log(`/api/p/${params.id}`);

  const {data, refetch} = useQuery<data>("post", async ()=> await axios.get(`/api/p/${params.id}`).then((res) => res.data), {refetchOnWindowFocus:false})
  const user = useContext(UserContext);  

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
          <PostCard author={data.author} likedBy={data.likedBy} liked={data.likedBy.some((e)=>{return e.id == user.id})} title={data.title} type={data.type} community={data.community} cardType="" comments={data.comments.length >= 0 ? data.comments.length : 0 } content={data.content} likeCount={data.likedBy.length} id={data.id} refetch={refetch} />
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
                <Smile width={32} />
                <input className="ml-auto button-colored" required={true} type="submit" name="" id="" onClick={submitComment} />
              </div>
            </form>
          </div>
          <p>Comments</p>
          <ul className="flex flex-col-reverse">
            {data.comments?.map((ele, i) => (
              <li key={i}>
                <Comment author={ele.author} content={ele.content} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    );
  }
  return (
    <main className="flex flex-col gap-2 p-4 pt-16 mr-auto ml-auto max-w-[750px] lg:col-start-2">
      <section>
        <PostCardSkeleton/>
      </section>
      <section>
        <PostCardSkeleton/>
      </section>
    </main>
  );
};

export default PostPage;


type data = {
  author: {
    name: string
    displayName: string;
    avatar:string,
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
    name:string;
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