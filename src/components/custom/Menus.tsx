"use client";

import { FC, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { ROLES, RolesType } from "@/interface/roles";
import { intersection, isEmpty } from "lodash";

import { cn } from "@/lib/utils";

import { ButtonUI } from "../ui/button";
import { Popover, PopoverTrigger } from "../ui/popover";
import Icon, { iconType } from "./Icon";
import SkeletonMenus from "./Skeletons/SkeletonMenus";
import { useQueryString } from "@/hooks/useQueryString";

interface MenusProps {
  profile?: Record<string, any>;
  role?: RolesType;
  isLoading?: boolean;
}

const Menus: FC<MenusProps> = ({ isLoading, role, profile }) => {
  const pathname = usePathname();
  const [profileOpened, setProfileOpened] = useState(false);
  const { companyId } = useParams<{ companyId: string }>();

  const { getQueryObject } = useQueryString();
  const { countryId } = getQueryObject(["countryId"]);
  const countryQuery = countryId ? `?countryId=${countryId}` : "";

  useEffect(() => {
    setProfileOpened(false);
  }, [pathname]);

  const routes: {
    href: string;
    label: string;
    isActive: boolean;
    icon: iconType;
    roles?: RolesType[];
  }[] = [
      {
        label: "Dashboard",
        href: `/`,
        icon: "House",
        isActive: `/` === pathname,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        label: "Countries",
        href: `/countries`,
        icon: "Globe",
        isActive: `/countries` === pathname,
        roles: [ROLES.SUPER_ADMIN],
      },
      {
        label: "Companies",
        href: `/companies`,
        icon: "Building",
        isActive: `/companies` === pathname,
        roles: [ROLES.SUPER_ADMIN, ROLES.COUNTRY_DIRECTOR],
      },
      {
        label: "Zones",
        href: `/companies/${companyId || profile?.companyId}/zones`,
        icon: "Globe",
        isActive: pathname.includes("zones"),
        roles: [ROLES.COMPANY_ADMIN, ROLES.OPERATION_MANAGER],
      },
      {
        label: "Staff",
        href: `/companies/${companyId || profile?.companyId}/staff`,
        icon: "Users",
        isActive: pathname.includes("staff"),
        roles: [ROLES.COMPANY_ADMIN, ROLES.OPERATION_MANAGER],
      },
      {
        label: "Sites",
        href: `/companies/${companyId || profile?.companyId}/sites`,
        icon: "Fence",
        isActive: pathname.includes("sites"),
        roles: [ROLES.COMPANY_ADMIN, ROLES.OPERATION_MANAGER],
      },
      {
        label: "Gadgets",
        href: `/companies/${companyId || profile?.companyId}/gadgets`,
        icon: "Watch",
        isActive: pathname.includes("gadgets"),
        roles: [ROLES.COMPANY_ADMIN, ROLES.OPERATION_MANAGER],
      },
      {
        label: "Events",
        href: `/companies/${companyId || profile?.companyId}/events`,
        icon: "Logs",
        isActive: pathname.includes("events"),
        roles: [ROLES.COMPANY_ADMIN, ROLES.OPERATION_MANAGER],
      },
      {
        label: "Settings",
        href: `/companies/${companyId || profile?.companyId}/settings`,
        icon: "Settings",
        isActive: pathname.includes("settings"),
        roles: [ROLES.COMPANY_ADMIN],
      },
      {
        label: "Gadgets",
        href: `/gadgets`,
        icon: "Watch",
        isActive: pathname.includes("gadgets"),
        roles: [ROLES.SUPER_ADMIN, ROLES.COUNTRY_DIRECTOR],
      },
      {
        label: "Users",
        href: `/users`,
        icon: "Users",
        isActive: `/users` === pathname,
        roles: [ROLES.SUPER_ADMIN, ROLES.COUNTRY_DIRECTOR],
      },
      // {
      //   label: "Settings",
      //   href: `/settings`,
      //   icon: "Settings",
      //   isActive: `/settings` === pathname,
      //   roles: [ROLES.SUPER_ADMIN],
      // },
    ];

  return (
    <div className="h-full border-b py-5 pb-2">
      <nav className="flex h-full flex-col justify-between">
        <ul className="flex h-full flex-col gap-1">
          {isLoading ? (
            <SkeletonMenus />
          ) : (
            routes.map(
              (route) =>
                !isEmpty(intersection([role], route.roles)) && (
                  <li key={route.href}>
                    <Link
                      href={route.href + countryQuery}
                      className={cn(
                        "flex hover:bg-gray-100 items-center space-x-3 rounded-md p-2 text-sm font-semibold transition-colors hover:text-primary",
                        {
                          "bg-primary text-white hover:text-white hover:bg-primary":
                            route.isActive,
                        }
                      )}
                    >
                      <Icon size="18px" name={route.icon} />
                      <span>{route.label}</span>
                    </Link>
                  </li>
                )
            )
          )}


          <Link
            href="/profile"
            className={cn(
              "mt-auto flex items-center justify-start gap-3 p-0 px-2 font-semibold transition-colors hover:text-primary ",
            )}
          >
            <Icon name="UserCog" size="18px" />
            <div className="w-32 truncate">
              <span>{profile?.email || "Account"}</span>
            </div>
          </Link>
        </ul>
      </nav>
    </div >
  );
};

export default Menus;
