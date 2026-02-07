import { useMemo } from "react";
import { usePathname } from "next/navigation";
import pageRoles, { PageRoleValueType } from "@/constants/pageRoles";
import { intersection, isEmpty, keys } from "lodash";

import { useProfile } from "./convex/useProfile";
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
  const { data, isLoading, isSuccess } = useProfile();

  const memoizedReturn = useMemo((): permissionType => {
    if (!isLoading && isSuccess) {
      const concernedPageKey = keys(pageRoles)
        .filter((key) => path?.includes(key))
        .sort((a, b) => b.length - a.length)?.[0];

      if (concernedPageKey) {
        const currentPageRole = pageRoles?.[
          concernedPageKey
        ] as PageRoleValueType;

        const hasRequiredRole = !isEmpty(
          intersection(currentPageRole.roles, [data?.role])
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
  }, [path, isLoading, isSuccess]);

  return {
    canAccess: memoizedReturn.roles && memoizedReturn.status,
    permissions: memoizedReturn,
    userRole: data?.role as RolesType,
    data: data as IUnknown,
  };
};
