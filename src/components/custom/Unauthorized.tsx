import { FC } from "react";
import Alert from "./Alert";
import Image from "next/image";
import { PageRoleValueType } from "@/constants/pageRoles";

export type permissionType = {
  roles: boolean;
  status: boolean;
  pageRole?: PageRoleValueType;
};

interface UnAuthorizedProps {
  permissions: permissionType;
}

const UnAuthorized: FC<UnAuthorizedProps> = ({ permissions }) => {
  return (
    <div className="mt-[10%] flex h-full w-full flex-col  items-center gap-4">
      <Alert
        message={
          !permissions?.status && !permissions?.roles
            ? "Sorry you don't have access to this page"
            : !permissions?.status
            ? "Be patient with us, we are activating your account!"
            : "Sorry you don't have access to this page"
        }
      />
      <Image src="/assets/503.svg" alt="Placeholder" width={300} height={300} />
    </div>
  );
};
export default UnAuthorized;
