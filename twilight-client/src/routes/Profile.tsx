import { Tab } from "@headlessui/react";
import { CDN } from "../utils";

const Profile = () => {
  return (
    <main className="flex flex-col gap-2 p-6 mt-20 mr-auto ml-auto max-w-[800px] lg:col-start-2 bg-nord-snow-200 dark:bg-nord-night-300 rounded-md drop-shadow-md">
      <section className="flex gap-4">
        <img src={CDN("default.svg")} alt="" className="w-48 h-48 border border-nord-frost-300/50 rounded-full" />
        <div className="flex flex-col gap-2 justify-evenly text-justify">
          <h1 className="text-xl">TheSillus</h1>
          <p className="dark:text-slate-400 text-slate-600">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Sapiente ratione molestias asperiores eveniet et, id esse fugiat omnis. Voluptatum officia aperiam aut ea ex
            veritatis. Ipsum quaerat velit eveniet reprehenderit.
          </p>
        </div>
      </section>
      <section>
        <Tabs/>
      </section>
    </main>
  );
};

const Tabs = () => {
  return (
    <Tab.Group>
      <Tab.List className="flex bg-nord-frost-300/40 justify-around rounded-md p-1">
        <Tab className={({selected})=>{return selected ? "bg-nord-frost-300/60 shadow-shadowFrost p-2 w-full rounded-l-md" : "p-2 bg-none w-full"}}>Posts</Tab>
        <Tab className={({selected})=>{return selected ? "bg-nord-frost-300/60 shadow-shadowFrost p-2 w-full" : "p-2 bg-none w-full"}}>Communities</Tab>
        <Tab className={({selected})=>{return selected ? "bg-nord-frost-300/60 shadow-shadowFrost p-2 w-full rounded-r-md" : "p-2 bg-none w-full"}}>Saved</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>Content 1</Tab.Panel>
        <Tab.Panel>Content 2</Tab.Panel>
        <Tab.Panel>Content 3</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Profile;
