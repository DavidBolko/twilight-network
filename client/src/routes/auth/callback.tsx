import { createFileRoute, redirect } from "@tanstack/react-router";

import { auth } from "../../auth/auth";
import { currentUserSchema } from "../../types";
import { api } from "../../api";
import { queryClient } from "../../main";

export const Route = createFileRoute("/auth/callback")({
beforeLoad: async () => {
await auth.signinRedirectCallback();

const response = await api.get("users/me");
const user = currentUserSchema.parse(response);

queryClient.setQueryData(["currentUser"], user);

throw redirect({
  to: "/",
  search: {
    posts: "hot",
    time: "all",
  },
});

},
});
