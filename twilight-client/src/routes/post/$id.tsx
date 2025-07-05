import {createFileRoute, useLoaderData} from '@tanstack/react-router'
import axios from "axios";
import {Smile} from 'lucide-react';

export const Route = createFileRoute("/post/$id")({
    loader: async ({params}) => {
        const res = await axios.get(`http://localhost:8080/api/p/${params.id}`);
        return res.data;
    },
    component: RouteComponent,
});

function RouteComponent() {
    const post: Post = useLoaderData({from: Route.id});

    if (post) {
        return (
            <main className="flex flex-col gap-2 p-4 pt-16 mr-auto ml-auto max-w-[750px] lg:col-start-2">
                <section>
                    <PostCard author={data.author} likedBy={data.likedBy} liked={data.likedBy.some((e) => {
                        return e.id == user.id
                    })} title={data.title} type={data.type} community={data.community} cardType=""
                              comments={data.comments.length >= 0 ? data.comments.length : 0} content={data.content}
                              likeCount={data.likedBy.length} id={data.id} refetch={refetch}/>
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
                                <Smile width={32}/>
                                <input className="ml-auto button-colored" required={true} type="submit" name="" id=""
                                       onClick={submitComment}/>
                            </div>
                        </form>
                    </div>
                    <p>Comments</p>
                    <ul className="flex flex-col-reverse">
                        {data.comments?.map((ele, i) => (
                            <li key={i}>
                                <Comment author={ele.author} content={ele.content}/>
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
            </section>
            <section>
            </section>
        </main>
    );
}
