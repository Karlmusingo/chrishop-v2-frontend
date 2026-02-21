"use client";
import { DashboardComponent } from "@/components/dashboard";
import PageHeader from "@/components/custom/PageHeader";
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
    <div>
      <PageHeader title="Tableau de bord" subtitle="Vue d'ensemble de votre activité" />
      <div className="py-4">
        <DashboardComponent userRole={userRole} dashboardData={dashboardData} />
      </div>
    </div>
  );
}
