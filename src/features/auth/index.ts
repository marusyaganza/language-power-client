// Public surface of the auth feature. Pages are imported by path from the router so they can be lazy-loaded.
export { authKeys, useCurrentUser, useLogout } from "./queries";
export type { User } from "./schemas";
