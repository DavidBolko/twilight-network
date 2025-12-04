import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import axios from "axios";
import { queryClient } from "../../main";
import type { User } from "../../types";
import { getFromCdn } from "../../utils";
import { ArrowUpIcon, BanIcon, ShieldIcon } from "lucide-react";

type AdminUsersResponse = {
  users: User[];
  page: number;
  size: number;
  totalPages: number;
  totalUsers: number;
};

const usersQueryKey = (page: number) => ["admin-users", page];

const fetchUsers = async (page: number) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users?page=${page}&size=20`, { withCredentials: true });
  return res.data;
};

const banUser = async (id: string) => {
  await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/ban`, {}, { withCredentials: true });
};

const promoteUser = async (id: string) => {
  await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}/promote`, {}, { withCredentials: true });
};

export const Route = createFileRoute("/admin/owls")({
  loader: async () => {
    // Pred-fetch prvej strany
    await queryClient.prefetchQuery({
      queryKey: usersQueryKey(1),
      queryFn: () => fetchUsers(1),
      staleTime: 60_000,
    });
    return {};
  },
  component: OwlsPage,
});

function OwlsPage() {
  const [page, setPage] = useState(0);

  const { data, isLoading, isError, refetch } = useQuery<AdminUsersResponse>({
    queryKey: usersQueryKey(page),
    queryFn: () => fetchUsers(page),
    staleTime: 60_000,
  });

  if (isLoading) return <p className="p-4">Loading...</p>;
  if (isError || !data) return <p className="p-4">Failed to load users.</p>;

  const { users, totalPages } = data;

  const handleBan = async (id: string) => {
    await banUser(id);
    refetch();
  };

  const handlePromote = async (id: string) => {
    await promoteUser(id);
    refetch();
  };
  console.log(data);

  return (
    <div className="p-4 card">
      <h1 className="text-xl font-semibold mb-4">Users</h1>

      <ul className="flex flex-col gap-2">
        {users.map((u: User) => (
          <li key={u.id} className="card flex-row justify-between p-2 border border-tw-border rounded-md">
            <div className="flex gap-2 items-center">
              <img src={u.image ? getFromCdn(u.image) : "/anonymous.png"} className="w-12 h-12 border border-white/15 rounded-full object-cover transition-all duration-300 hover:opacity-50 hover:grayscale" alt="avatar" />
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-gray-500 text-sm">{u.email}</p>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <button className="btn danger h-fit p-2" onClick={() => handleBan(u.id)}>
                <BanIcon />
              </button>

              <button className="btn primary h-fit p-2" onClick={() => handlePromote(u.id)}>
                <ShieldIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex justify-center gap-4 mt-4">
        <button className="btn" disabled={page < 1} onClick={() => setPage((p) => p - 1)}>
          Prev
        </button>

        <span>
          Page {page} / {totalPages}
        </span>

        <button className="btn" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}

export default OwlsPage;
