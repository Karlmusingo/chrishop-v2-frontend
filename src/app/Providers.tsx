"use client";

import { FC, PropsWithChildren } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthProvider } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(
  process.env.NEXT_PUBLIC_CONVEX_URL as string,
);

const Providers: FC<PropsWithChildren> = ({ children }) => {
  return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
};

export default Providers;
