"use client";
import { Header } from "@/components/custom/Header";
import { useProfile } from "@/hooks/convex/useProfile";
import { useQueryString } from "@/hooks/useQueryString";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import UpdatePassword from "./profile/UpdatePassword";
import { useConvexAuth } from "convex/react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { getQueryObject } = useQueryString();
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { isLoading, isSuccess, data } = useProfile();
  const [openUpdatePassword, setOpenUpdatePassword] = useState(false);

  const { hasInitialPasswordChanged } = getQueryObject();

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
        <div className="animate-spin h-8 w-8 rounded-full border-4 border-gray-300 border-t-black" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen">
      <Header />
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
      <div className=" mt-20 p-8 bg-[#FBFBFB]">{children}</div>
    </div>
  );
};

export default DashboardLayout;
