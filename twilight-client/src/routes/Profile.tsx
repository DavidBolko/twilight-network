import { Tab } from "@headlessui/react";
import { FC } from "react";
import { useQuery } from "react-query";
import { useSearchParams } from "react-router-dom";
import PostCard from "../components/PostCard";
import { CDN, fetcher } from "../utils";

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = searchParams.get("user")!;
  return (
    <main className="flex flex-col gap-2 p-6 mt-20 mr-auto ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
      <section className="flex gap-4">
        <img src={CDN("default.svg")} alt="" className="w-48 h-48 border border-nord-frost-300/50 rounded-full" />
        <div className="flex flex-col gap-2 justify-evenly text-justify">
          <h1 className="text-xl">TheSillus</h1>
          <p className="dark:text-slate-400 text-slate-600">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente ratione molestias asperiores eveniet et, id esse fugiat omnis. Voluptatum officia aperiam aut ea ex veritatis. Ipsum quaerat velit eveniet reprehenderit.</p>
        </div>
      </section>
      <section>
        <Tabs user={user} />
      </section>
    </main>
  );
};

type tabsProps = {
  user: string;
};

const Tabs: FC<tabsProps> = (tabsProps) => {
  return (
    <Tab.Group>
      <Tab.List className="flex bg-moonlight-200/40 justify-around rounded-md">
        <Tab className={({ selected }) => {
          return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-l-md p-2" : "p-2 bg-none w-full";
        }}
        >
          Posts
        </Tab>
        <Tab
          className={({ selected }) => {
            return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full p-2" : "p-2 bg-none w-full";
          }}
        >
          Communities
        </Tab>
        <Tab
          className={({ selected }) => {
            return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-r-md p-2" : "p-2 bg-none w-full";
          }}
        >
          Saved
        </Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <PostTab user={tabsProps.user} />
        </Tab.Panel>
        <Tab.Panel>Content 2</Tab.Panel>
        <Tab.Panel>Content 3</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

type data = [
  {
    author: {
      displayName: string;
    };
    comments: number;
    community: {
      displayName: string;
      id: string;
      Img: string;
    };
    content: string;
    type: string;
    id: string;
    likeCount: number;
    title: string;
    userId: string;
    liked: boolean;
  }
];

const PostTab: FC<tabsProps> = (tabsProps) => {
  const { isLoading, isError, error, data, refetch } = useQuery<data, Error>({
    queryFn: () => fetcher(`/api/user/followed`),
    queryKey: ["followed"],
    refetchOnWindowFocus: false,
    retry: false,
  });
  console.log(data);
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {data?.map((ele) => (
        <PostCard cardType="com" author={ele.author} comments={ele.comments} community={ele.community} refetch={refetch} content={ele.content} id={ele.id} likeCount={ele.likeCount} title={ele.title} type={ele.type} userId={ele.userId} liked={ele.liked} />
      ))}
    </ul>
  );
};

export default Profile;
