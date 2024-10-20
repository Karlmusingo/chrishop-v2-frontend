import Image from "next/image";
import Button from "../Button";
import {
  NavigationMenu,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetTrigger, SheetContent } from "@/components/ui/sheet";

import Link from "next/link";
// import { menuItems } from "../Header";
import Socials from "../Socials";

const menuItems = [
  { name: "Home", path: "/" },
  {
    name: "Features",
    path: "/#",
  },
  {
    name: "Pricing",
    path: "/#",
  },
  {
    name: "Contact",
    path: "/#",
  },
];

export function Footer() {
  return (
    <footer className="w-full px-4 lg:px-14 bg-white ">
      <div className="flex items-center justify-between  h-52 ">
        {/* <div className="flex items-center">
          <Image src="/logo.png" alt="Protekt Logo" width={150} height={54} />
        </div>
        <nav className=" p-4 flex">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-normal hover:text-accent-foreground"
              prefetch={false}
            >
              {item.name}
            </Link>
          ))}
        </nav> */}
      </div>

      <div className="w-full h-1 border-b-2 border-black" />
      <div className="flex justify-between items-center  space-x-2 h-24 ">
        <Socials />
        <div className="flex items-center space-x-2 h-24">
          <div>
            <span>
              ©{new Date().getFullYear()} Protekt. All right reserved.
            </span>
          </div>
          <div>
            <a className="underline cursor">Privacy Policy</a>
          </div>
          <div>
            <a className="underline cursor">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
