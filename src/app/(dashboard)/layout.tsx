"use client";
import { Header } from "@/components/custom/Header";
import { useGetProfile } from "@/hooks/api/users/profile";
import { useQueryString } from "@/hooks/useQueryString";
import { removeToken } from "@/lib/token";
import { useParams, useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import UpdatePassword from "./profile/UpdatePassword";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { getQueryObject } = useQueryString();
  const { isLoading, isSuccess, data } = useGetProfile();
  const [openUpdatePassword, setOpenUpdatePassword] = useState(false);

  const { firstLogin } = getQueryObject();

  useEffect(() => {
    if (!isLoading && !isSuccess) {
      removeToken();
      router.replace("/login");
    }
    if (isSuccess && firstLogin === "true") {
      setOpenUpdatePassword(true);
    }
  }, [isSuccess, isLoading]);

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
