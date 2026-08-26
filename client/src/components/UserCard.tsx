import { Link } from "@tanstack/react-router";
import type { User as User } from "../types";
import { getFromCdn } from "../utils";
export default function UserCard({ userName, avatar, id }: User) {
  return (
    <Link
      to="/user/$id"
      params={{ id }}
      search={{ tab: "Posts" }}
      className="flex items-center gap-3 p-4 card-interactive"
    >
      <img className="avatar size-10" src={avatar ? getFromCdn(avatar) : "/anonymous.png"} alt="" />
      <p className="font-medium truncate">{userName}</p>
    </Link>
  );
}