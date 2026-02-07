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

  const { firstLogin } = getQueryObject();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (isSuccess && firstLogin === "true") {
      setOpenUpdatePassword(true);
    }
  }, [isSuccess, isLoading, isAuthenticated, authLoading]);

  return (
    <div className="h-screen">
      <Header />
      {firstLogin === "true" && (
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
