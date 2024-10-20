"use client";
import { SVGProps } from "react";
import { usePathname, useRouter } from "next/navigation";

import {
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenu,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuContent,
  DropdownMenu,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { useGetProfile } from "@/hooks/api/users/profile";
import { UserRoles } from "@/interface/roles";

import { Ellipsis } from "lucide-react";
import Button from "../Button";
import { removeToken } from "@/lib/token";

export interface IMenuItem {
  name: string;
  path: string;
  selected?: boolean;
  roles: string[];
}

const menuItems: IMenuItem[] = [
  { name: "Dashboard", path: "/", roles: [UserRoles.ADMIN] },
  {
    name: "Ventes",
    path: "/orders",
    roles: [],
  },
  {
    name: "Inventaire",
    path: "/inventories",
    roles: [],
  },
  {
    name: "Produit",
    path: "/products",
    roles: [],
  },
  {
    name: "Boutique",
    path: "/locations",
    roles: [UserRoles.ADMIN],
  },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const { data } = useGetProfile();

  const signOut = () => {
    removeToken();
    router.replace("/login");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-20 w-full shrink-0 items-center border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-950 md:px-8">
      <div className="w-[150px]">
        <Link className="mr-6 flex items-center" href="#">
          <MountainIcon className="h-6 w-6" />
          <span className="sr-only">Acme Inc</span>
        </Link>
      </div>
      <div className="flex w-full justify-center">
        <NavigationMenu className="hidden items-center gap-6 md:flex">
          <NavigationMenuList className="flex">
            {menuItems.map((item) => (
              <NavigationMenuLink
                asChild
                key={item.name}
                active={pathname === item.path}
              >
                <Link
                  className="text-md group inline-flex h-9 w-max items-center justify-center rounded-md border-red-300 px-4 py-2 font-medium underline-offset-[11px] transition-colors hover:underline focus:bg-gray-100 focus:text-gray-900 focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:border-b-2 data-[active]:bg-gray-100/50 data-[state=open]:bg-gray-100/50 data-[active]:no-underline dark:bg-gray-950 dark:hover:bg-gray-800 dark:hover:text-gray-50 dark:focus:bg-gray-800 dark:focus:text-gray-50 dark:data-[active]:bg-gray-800/50 dark:data-[state=open]:bg-gray-800/50"
                  href={item.path}
                >
                  {item.name}
                </Link>
              </NavigationMenuLink>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              size="icon"
              variant="ghost"
              className="focus-visible:ring-0"
            >
              <Ellipsis className="mr-2" size={24} strokeWidth={3} />
              <span className="sr-only">Plus</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href={"/profile"}>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={"/users"}>Utilisateurs</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Deconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function MountainIcon(
  props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>
) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
    </svg>
  );
}
