"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Button from "./Button";
import Menus from "./Menus";
import Icon from "./Icon";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useProfile } from "@/hooks/convex/useProfile";
import { useAuthActions } from "@convex-dev/auth/react";
import { RolesType } from "@/interface/roles";

const Sidebar = () => {
  const router = useRouter();
  const { data, isLoading } = useProfile();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className=" fixed left-0 top-0 flex h-full w-56 flex-col border-r px-6 py-4 bg-white">
      <div className="flex justify-center mb-8">
        <Image src="/logo.png" alt="logo" width={160} height={32} />
      </div>
      <Menus profile={data ?? undefined} role={data?.role as RolesType | undefined} isLoading={isLoading} />
      <div className="mt-auto flex items-center justify-between gap-1 py-2">
        <Button
          size="sm"
          variant="ghost"
          className="p-0 hover:bg-transparent"
          onClick={() => handleSignOut()}
        >
          <Link
            href="#"
            className={cn(
              "flex items-center space-x-3 rounded-md p-2 text-sm font-semibold transition-colors hover:text-primary"
            )}
          >
            <Icon size="18px" name="LogOut" />
            <span>Logout</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
