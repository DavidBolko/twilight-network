import { json, redirect, useParams } from "react-router-dom";
import Navbar from "../../components/Navbar";
import PostCard from "../../components/PostCard";
import useSWR, { preload } from "swr";
import { CDN, fetcher } from "../../utils";
import { ServerStackIcon } from "@heroicons/react/24/solid";
import ErrorPage from "../ErrorPage";
import { useEffect } from "react";
import PostCardCommunity from "../../components/PostCardCommunity";

interface data {
  DisplaName: string;
  desc: string;
  Img: string;
}

const Community = () => {
  const params = useParams();
  console.log(params);

  const { data, error } = useSWR<data, Error>(
    `/api/c/${params.cName}`,
    fetcher
  );

  if (error) {
    return <ErrorPage error={JSON.parse(error?.message)} />;
  }
  if (!data) {
    return (
      <>
        <Navbar />
        <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4 blur-xl">
          <main className="flex col-span-2 col-start-2">
            <ul className="flex flex-col gap-6">
              <PostCardCommunity img="xa" author="TheSillus" comments={321} />
              <PostCardCommunity img="ba" author="TheSillus" comments={321} />
              <PostCardCommunity img="hi" author="TheSillus" comments={321} />
              <PostCardCommunity img="he" author="TheSillus" comments={321} />
            </ul>
          </main>
          <div className="flex flex-col gap-2 p-4 text-justify bg-slate-700 h-fit rounded-lg">
            <div className="flex gap-2">
              <div>
                <h1 className="text-3xl">Jennie</h1>
                <p>62k followers</p>
              </div>
            </div>
            <p>
              Lorem ipsum dolor sit amet consectetur, adipisicing elit.
              Voluptates mollitia unde vel consectetur aliquid dolores ratione
              adipisci magni inventore ducimus? Non explicabo aliquam, vitae
              dignissimos consequuntur culpa id quae necessitatibus.
            </p>
            <a className="button-violet" href="#">
              Make a post
            </a>
            <a className="button-violet" href="#">
              Follow
            </a>
          </div>
        </section>
      </>
    );
  }
  return (
    <>
      <Navbar />
      <section className="flex flex-col-reverse lg:grid grid-cols-4 pt-20 p-4 gap-4">
        <main className="flex col-span-2 col-start-2">
          <ul className="flex flex-col gap-6">
            <PostCardCommunity img="xa" author="TheSillus" comments={321} />
            <PostCardCommunity img="ba" author="TheSillus" comments={321} />
            <PostCardCommunity img="hi" author="TheSillus" comments={321} />
            <PostCardCommunity img="he" author="TheSillus" comments={321} />
          </ul>
        </main>
        <div className="flex flex-col gap-2 p-4 text-justify bg-slate-700 h-fit rounded-lg">
          <div className="flex gap-2">
            <img
              src={CDN(data.Img)}
              alt=""
              className="w-16 h-16 rounded-full"
            />
            <div>
              <h1 className="text-3xl">Jennie</h1>
              <p>62k followers</p>
            </div>
          </div>
          <p>
            Lorem ipsum dolor sit amet consectetur, adipisicing elit. Voluptates
            mollitia unde vel consectetur aliquid dolores ratione adipisci magni
            inventore ducimus? Non explicabo aliquam, vitae dignissimos
            consequuntur culpa id quae necessitatibus.
          </p>
          <div className="flex gap-2">
            <a className="button-normal" href="#">
              Make a post
            </a>
            <a className="button-violet" href="#">
              Follow
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default Community;
