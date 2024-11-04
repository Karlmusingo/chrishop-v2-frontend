import { useMemo } from "react";
import { usePathname } from "next/navigation";
import pageRoles, { PageRoleValueType } from "@/constants/pageRoles";
import { intersection, isEmpty, keys } from "lodash";

import { useGetProfile } from "./api/users/profile";
import { RolesType } from "@/interface/roles";
import { IUnknown } from "@/interface/Iunknown";

export type permissionType = {
  roles: boolean;
  status: boolean;
  pageRole?: PageRoleValueType;
};

interface usePermissionReturnType {
  canAccess: boolean;
  permissions: permissionType;
  userRole: RolesType;
  data: IUnknown;
}

export const usePermission = (): usePermissionReturnType => {
  const path = usePathname();
  const { data, isPending, isSuccess } = useGetProfile();

  const memoizedReturn = useMemo((): permissionType => {
    if (!isPending && isSuccess) {
      const concernedPageKey = keys(pageRoles)
        .filter((key) => path?.includes(key))
        .sort((a, b) => b.length - a.length)?.[0];

      if (concernedPageKey) {
        const currentPageRole = pageRoles?.[
          concernedPageKey
        ] as PageRoleValueType;

        const hasRequiredRole = !isEmpty(
          intersection(currentPageRole.roles, data?.roles)
        );
        const accessBasedOnStatus = currentPageRole.internalPublic
          ? true
          : data?.status === "ACTIVE";

        return {
          roles: hasRequiredRole,
          status: accessBasedOnStatus,
          pageRole: currentPageRole,
        };
      } else {
        return { roles: true, status: true };
      }
    } else {
      return { roles: false, status: false };
    }
  }, [path, isPending, isSuccess]);

  return {
    canAccess: memoizedReturn.roles && memoizedReturn.status,
    permissions: memoizedReturn,
    userRole: data?.role,
    data,
  };
};
