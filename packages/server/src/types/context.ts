import { User } from "../generated/prisma";

export interface UserContext {
  user: User | null;
}
