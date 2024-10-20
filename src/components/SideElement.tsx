import { useGetList } from "@/hooks/api/common/getAll";
import { IUnknown } from "@/interface/Iunknown";
import { RolesType, UserRoles } from "@/interface/roles";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

export const SideElement: React.FC<{
  zones?: boolean;
  supervisors?: boolean;
  guards?: boolean;
  sites?: boolean;
  gadgets?: boolean;
  role?: RolesType;
  info?: IUnknown;
  onGuardSeeAllClick?: () => void;
}> = ({ zones, supervisors, guards, sites, role, info, gadgets, onGuardSeeAllClick }) => {
  const { companyId } = useParams<{ companyId: string }>();

  const zoneList: any[] = info?.zones || [];
  const supervisorList =
    (info?.users || info?.staff)?.filter(
      (user: IUnknown) => user.role === UserRoles.SUPERVISOR
    ) || [];
  const guardList =
    (info?.users || info?.staff || info?.guards)?.filter(
      (user: IUnknown) => user.role === UserRoles.GUARD
    ) || [];
  const siteList = info?.sites || [];
  const gadgetsList = info?.gadgets || [];

  return (
    <aside className="h-fit rounded-lg bg-background w-64 border">
      {zones && (
        <div>
          <div className="sticky rounded-lg top-0 flex items-center justify-between border-b bg-background px-4 py-3">
            <h3 className="text-lg font-medium">Zones</h3>
            <Link
              href={`/companies/${companyId}/zones`}
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              See all
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {zoneList.map((zone: IUnknown) => (
                <div
                  key={zone.id}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{zone.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {zone?._count?.sites || 0} sites
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {supervisors && (
        <div>
          <div className="sticky rounded-lg bottom-0 flex items-center justify-between border-t bg-background px-4 py-3">
            <h3 className="text-lg font-medium">Supervisors</h3>
            <Link
              href={`/companies/${companyId}/staff?role=supervisors`}
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              See all
            </Link>
          </div>

          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {supervisorList.map((supervisor: IUnknown) => (
                <div
                  key={supervisor.id}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{`${supervisor.firstName} ${supervisor.lastName}`}</div>
                  <div className="text-sm text-muted-foreground">
                    {supervisor?.zone?.name || ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {guards && (
        <div>
          <div className="sticky rounded-lg bottom-0 flex items-center justify-between border-t bg-background px-4 py-3">
            <h3 className="text-lg font-medium">Guards</h3>
            <Link
              href={onGuardSeeAllClick ? '#' : `/companies/${companyId}/staff?role=guards`}
              className="text-sm font-medium hover:underline"
              prefetch={false}
              onClick={onGuardSeeAllClick}
            >
              See all
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {guardList.map((guard: IUnknown) => (
                <div
                  key={guard.id}
                  className="flex items-center justify-between"
                >
                  <div className={`font-mediumi ${guard.isTeamLead ? "bg-red-300 p-1 rounded-sm" : ''}`}>
                    {`${guard.firstName} ${guard.lastName}`}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {guard?.zone?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {sites && (
        <div>
          <div className="sticky rounded-lg bottom-0 flex items-center justify-between border-t bg-background px-4 py-3">
            <h3 className="text-lg font-medium">Sites</h3>
            <Link
              href={`/companies/${companyId}/sites`}
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              See all
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {siteList.map((site: any) => (
                <div
                  key={site.id}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{site.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {site?.zone?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gadgets && (
        <div>
          <div className="sticky rounded-lg bottom-0 flex items-center justify-between border-t bg-background px-4 py-3">
            <h3 className="text-lg font-medium">Gadgets</h3>
            <Link
              href={`/companies/${companyId}/gadgets`}
              className="text-sm font-medium hover:underline"
              prefetch={false}
            >
              See all
            </Link>
          </div>
          <div className="flex-1 overflow-auto">
            <div className="grid gap-3 p-4">
              {gadgetsList.map((gadget: any) => (
                <div
                  key={gadget.id}
                  className="flex items-center justify-between"
                >
                  <div className="font-medium">{gadget?.deviceId}</div>
                  <div className="text-sm text-muted-foreground">
                    {gadget?.guard?.firstName}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
