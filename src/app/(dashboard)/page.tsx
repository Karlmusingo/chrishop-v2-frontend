"use client";
import { DashboardComponent } from "@/components/dashboard";
import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";

export default function Home() {
  const { getQueryObject } = useQueryString();

  const { data } = useGetList({
    queryKey: "get-dashboard",
    endpoint: "/dashboard",
    filter: { ...getQueryObject() },
  });

  const dashboardData = data?.data || {};

  return (
    <main className="min-h-screen">
      <DashboardComponent dashboardData={dashboardData} />
    </main>
  );
}
