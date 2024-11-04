"use client";
import { DashboardComponent } from "@/components/dashboard";
import { useGetList } from "@/hooks/api/common/getAll";
import { usePermission } from "@/hooks/usePermission";
import { useQueryString } from "@/hooks/useQueryString";

export default function Home() {
  const { getQueryObject } = useQueryString();

  const { data } = useGetList({
    queryKey: "get-dashboard",
    endpoint: "/dashboard",
    filter: { ...getQueryObject() },
  });
  const { userRole } = usePermission();

  const dashboardData = data?.data || {};

  return (
    <main className="min-h-screen">
      <DashboardComponent userRole={userRole} dashboardData={dashboardData} />
    </main>
  );
}
