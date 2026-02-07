import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";

export const { auth, signIn, signOut, store } = convexAuth({
  providers: [
    Password<DataModel>({
      profile(params) {
        return {
          email: params.email as string,
        };
      },
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }

      // Link to existing user by email (admin-created users)
      const email = args.profile.email;
      if (email) {
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();
        if (existingUser) {
          return existingUser._id;
        }
      }

      // Create minimal user for new signups
      return ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
      });
    },
  },
});
