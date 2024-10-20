"use client";

import { FC } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { isEmpty } from "lodash";

import { cn } from "@/lib/utils";

import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from "@/components/ui/menubar";

export interface menuType {
  title: string;
  link?: string;
  sub?: {
    title: string;
    link: string;
  }[];
}

interface SubMenusProps {
  menus: menuType[];
}

const SubMenus: FC<SubMenusProps> = ({ menus }) => {
  const pathname = usePathname();

  const isMenuActive = (menu: menuType) => {
    if (menu.link) return pathname?.includes(menu.link);

    return menu.sub?.some((sub) => pathname.includes(sub.link));
  };

  return (
    <Menubar className=" w-fit">
      {menus.map((menu) => (
        <MenubarMenu key={menu?.title}>
          <MenubarTrigger
            className={cn({ " bg-slate-100": isMenuActive(menu) })}
          >
            {menu?.link ? (
              <Link href={`${menu.link}`}>{menu.title}</Link>
            ) : (
              menu.title
            )}
          </MenubarTrigger>
          {!isEmpty(menu.sub) && (
            <MenubarContent>
              {menu.sub?.map((subMenu) => (
                <MenubarItem key={subMenu.title}>
                  <Link className="w-full" href={`${subMenu.link}`}>
                    {subMenu.title}
                  </Link>
                </MenubarItem>
              ))}
            </MenubarContent>
          )}
        </MenubarMenu>
      ))}
    </Menubar>
  );
};
export default SubMenus;
