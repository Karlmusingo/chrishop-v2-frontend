import { FC, PropsWithChildren } from "react";

const AuthLayout: FC<PropsWithChildren> = ({ children }) => {
  return <div className="h-screen">{children}</div>;
};

export default AuthLayout;
