import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "../_generated/server";
import { Doc } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return null;

  return await ctx.db.get(userId);
}

export async function requireCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users">> {
  const user = await getCurrentUser(ctx);
  if (!user) {
    throw new Error("Unauthenticated");
  }
  return user;
}

export function requireRole(
  user: Doc<"users">,
  allowedRoles: Array<Doc<"users">["role"]>
) {
  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient role");
  }
}
