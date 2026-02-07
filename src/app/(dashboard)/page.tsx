"use client";
import { DashboardComponent } from "@/components/dashboard";
import { usePermission } from "@/hooks/usePermission";
import { useQueryString } from "@/hooks/useQueryString";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

export default function Home() {
  const { getQueryObject } = useQueryString();
  const { userRole, data: profileData } = usePermission();

  const queryObj = getQueryObject();

  const dashboardData =
    useQuery(api.functions.dashboard.getData, {
      location: queryObj.location as string | undefined,
      userLocationId: profileData?.locationId,
      userRole: userRole,
    }) ?? {};

  return (
    <main className="min-h-screen">
      <DashboardComponent userRole={userRole} dashboardData={dashboardData} />
    </main>
  );
}
