import { Link } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { getFromCdn } from "../utils";
import Modal from "./Modal";
import CreateCommunity from "./CreateCommunity";
import type { CommunityType } from "../types";

interface CommunityListProps {
  title: string;
  data: CommunityType[];
  allowCreate?: boolean;
}

const PREVIEW_COUNT = 3;

export default function CommunityList({ title, data, allowCreate }: CommunityListProps) {
  const [collapsed, setCollapsed] = useState(true);
  const [open, setOpen] = useState(false);

  const preview = data.slice(0, PREVIEW_COUNT);
  const rest = data.slice(PREVIEW_COUNT);

  return (
    <div className="panel">
      <div className="flex items-center justify-between p-2 w-full">
        <span className="flex gap-2 items-center">
          <p className="text-sm font-semibold opacity-60">{title}</p>
          {allowCreate && (
            <button
              onClick={() => setOpen(true)}
              className="link p-0 text-xs opacity-60 hover:opacity-100 justify-start"
            >
              <PlusIcon size={20} />
            </button>
          )}
        </span>
      </div>

      {data.length === 0 && <p className="text-xs p-2 italic opacity-50">Nothing here yet.</p>}

      {[...preview, ...(!collapsed ? rest : [])].map((c) => (
        <Link
          key={c.id}
          to="/communities/$id"
          params={{ id: String(c.id) }}
          search={{ posts: "hot", time: "all" }}
          className="link w-full justify-between"
        >
          <div className="flex items-center gap-2 overflow-hidden text-sm">
            <img
              className="size-6 rounded-full object-cover"
              src={c.image ? getFromCdn(c.image) : "/avatar.png"}
              alt=""
            />
            <span className="truncate">{c.name}</span>
          </div>
        </Link>
      ))}

      {rest.length > 0 && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-xs opacity-50 hover:opacity-100 text-left px-2 py-1 transition-opacity"
        >
          {collapsed ? `Show ${rest.length} more...` : "Show less"}
        </button>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)} background lightbox={false}>
          <div className="p-4">
            <CreateCommunity setIsOpen={setOpen} />
          </div>
        </Modal>
      )}
    </div>
  );
}