"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Box,
  Store,
  Users,
  User,
  LogOut,
  Shirt,
} from "lucide-react";
import { useProfile } from "@/hooks/convex/useProfile";
import { UserRoles } from "@/interface/roles";
import { useAuthActions } from "@convex-dev/auth/react";

interface NavItem {
  name: string;
  path: string;
  icon: React.ElementType;
  roles: string[];
}

const navItems: NavItem[] = [
  { name: "Tableau de bord", path: "/", icon: LayoutDashboard, roles: [UserRoles.ADMIN] },
  { name: "Ventes", path: "/orders", icon: ShoppingCart, roles: [] },
  { name: "Inventaire", path: "/inventories", icon: Package, roles: [] },
  { name: "Produits", path: "/products", icon: Box, roles: [] },
  { name: "Boutiques", path: "/locations", icon: Store, roles: [UserRoles.ADMIN] },
  { name: "Utilisateurs", path: "/users", icon: Users, roles: [UserRoles.ADMIN] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useProfile();
  const { signOut } = useAuthActions();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const visibleItems = navItems.filter((item) => {
    if (item.roles.length === 0) return true;
    return item.roles.includes(data?.role || "");
  });

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-sidebar flex-col bg-[#1A1A1A] text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent-primary)]">
          <Shirt className="h-5 w-5 text-white" />
        </div>
        <span className="font-serif text-xl font-semibold tracking-tight">
          ThreadCraft
        </span>
      </div>

      {/* Menu label */}
      <div className="px-6 pb-3 pt-4">
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[#666]">
          Menu
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-[#2A2A2A] text-white"
                  : "text-[#999] hover:bg-[#2A2A2A]/50 hover:text-white"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] ${
                  active ? "text-[var(--accent-primary)]" : "text-[#666]"
                }`}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#2A2A2A] p-4">
        <Link
          href="/profile"
          className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
            pathname === "/profile"
              ? "bg-[#2A2A2A] text-white"
              : "text-[#999] hover:bg-[#2A2A2A]/50 hover:text-white"
          }`}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2A2A2A]">
            <User className="h-4 w-4 text-[#999]" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">
              {data?.firstName} {data?.lastName}
            </p>
            <p className="truncate font-mono text-[11px] text-[#666]">
              {data?.role}
            </p>
          </div>
        </Link>
        <button
          onClick={handleSignOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#999] transition-colors hover:bg-[#2A2A2A]/50 hover:text-white"
        >
          <LogOut className="h-[18px] w-[18px] text-[#666]" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}
