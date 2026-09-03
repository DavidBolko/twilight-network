import { UserManager } from "oidc-client-ts";

export const auth = new UserManager({
  authority: "https://authservice.bolkodev.ipv64.de/realms/twilight",
  client_id: "twilight-app",
  redirect_uri: "http://localhost:5173/auth/callback",
  response_type: "code",
  scope: "openid profile email",
  post_logout_redirect_uri: `${window.location.origin}/`,
});