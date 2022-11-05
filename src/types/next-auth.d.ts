import { type User as BaseUser } from "./user";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: BaseUser;
  }

  type User = BaseUser;

  interface JWT {
    user: BaseUser;
  }
}
