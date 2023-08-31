import { Tab } from "@headlessui/react";
import { FC } from "react";
import PostTab from "./PostTab";
import Communities from "../Communities";

type tabsProps = {
  user: string;
};

const Tabs: FC<tabsProps> = (tabsProps) => {
  return (
    <Tab.Group>
      <Tab.List className="flex bg-moonlight-200/40 justify-around rounded-md">
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-l-md p-2" : "p-2 bg-none w-full";}}>Posts</Tab>
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full p-2" : "p-2 bg-none w-full";}}>Communities</Tab>
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-r-md p-2" : "p-2 bg-none w-full";}}>Saved</Tab>
      </Tab.List>
      <Tab.Panels>
        <Tab.Panel>
          <PostTab user={tabsProps.user} />
        </Tab.Panel>
        <Tab.Panel className="mt-2">
          <Communities/>
        </Tab.Panel>
        <Tab.Panel>Content 3</Tab.Panel>
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Tabs