import { FC, PropsWithChildren, Suspense } from "react";

const UsersLayout: FC<PropsWithChildren> = ({ children }) => {
  return <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>;
};

export default UsersLayout;
