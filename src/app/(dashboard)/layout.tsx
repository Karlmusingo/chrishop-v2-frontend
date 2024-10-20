"use client";
import { Header } from "@/components/custom/Header";
import { useGetProfile } from "@/hooks/api/users/profile";
import { removeToken } from "@/lib/token";
import { useRouter } from "next/navigation";
import { FC, PropsWithChildren, useEffect } from "react";

const DashboardLayout: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const { isLoading, isSuccess } = useGetProfile();

  useEffect(() => {
    if (!isLoading && !isSuccess) {
      removeToken();
      router.replace("/login");
    }
  }, [isSuccess, isLoading]);

  return (
    <div className="h-screen">
      <Header />
      <div className="ml-52 mt-20 p-8 bg-[#FBFBFB]">{children}</div>
    </div>
  );
};

export default DashboardLayout;
