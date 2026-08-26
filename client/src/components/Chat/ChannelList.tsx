import type { Channel } from "../../types";
import ChannelCard from "./ChannelCard";

type Props = {
  channels: Channel[];
  onPick: (id: number) => void;
};

export default function ChannelList({ channels, onPick }: Props) {
  return (
    <ul className="flex flex-col divide-y divide-tw-light-border dark:divide-tw-border overflow-y-auto">
      {channels.map((c) => (
        <li key={c.id}>
          <ChannelCard channel={c} pickChannel={onPick} />
        </li>
      ))}
    </ul>
  );
}