"use client";
import { Sidebar } from "@/components/custom/Sidebar";
import { useProfile } from "@/hooks/convex/useProfile";
import { useQueryString } from "@/hooks/useQueryString";
import { useMetaStore } from "@/hooks/zustand/useMetaStore";
import { usePathname, useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import UpdatePassword from "./profile/UpdatePassword";
import { useConvexAuth } from "convex/react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { getQueryObject } = useQueryString();
  const { resetData } = useMetaStore();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { isLoading, isSuccess, data } = useProfile();
  const [openUpdatePassword, setOpenUpdatePassword] = useState(false);

  const { hasInitialPasswordChanged } = getQueryObject();

  useEffect(() => {
    resetData();
  }, [pathname]);

  useEffect(() => {
    if (!authLoading && !isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, isLoading]);

  useEffect(() => {
    if (isSuccess && hasInitialPasswordChanged === "false") {
      setOpenUpdatePassword(true);
    }
  }, [isSuccess, hasInitialPasswordChanged]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-gray-300 border-t-[var(--accent-primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      {hasInitialPasswordChanged === "false" && (
        <UpdatePassword
          open={openUpdatePassword}
          setOpen={setOpenUpdatePassword}
          callback={() => {
            setOpenUpdatePassword(false);
            router.push("/");
          }}
        />
      )}
      <main className="ml-sidebar flex-1 overflow-y-auto bg-[var(--bg-primary)] px-10 py-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
