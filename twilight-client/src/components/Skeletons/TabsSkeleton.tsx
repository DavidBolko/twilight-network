import { Tab } from "@headlessui/react";
import { FC } from "react";

const TabsSkeleton: FC = () => {
  return (
    <Tab.Group>
      <Tab.List className="flex bg-moonlight-200/40 justify-around rounded-md opacity-30 pointer-events-none">
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-l-md p-2" : "p-2 bg-none w-full";}}>Posts</Tab>
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full p-2" : "p-2 bg-none w-full";}}>Communities</Tab>
        <Tab className={({ selected }) => {return selected ? "bg-moonlight-300/60 shadow-shadowFrost outline-none w-full rounded-r-md p-2" : "p-2 bg-none w-full";}}>Saved</Tab>
      </Tab.List>
    </Tab.Group>
  );
};

export default TabsSkeleton