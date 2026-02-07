import {
  QueryCtx,
  MutationCtx,
  ActionCtx,
} from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export async function getCurrentUser(
  ctx: QueryCtx | MutationCtx
): Promise<Doc<"users"> | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  const email = identity.email;
  if (!email) return null;

  return await ctx.db
    .query("users")
    .withIndex("by_email", (q) => q.eq("email", email))
    .first();
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
  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient role");
  }
}
