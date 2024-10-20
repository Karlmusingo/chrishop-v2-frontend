"use client";

import { FC, Suspense, useState } from "react";

import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";
import { useSearch } from "@/hooks/useSearch";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { filterOptions, getColumns } from "./table";
import { RolesList, UserRoles } from "@/interface/roles";
import { IUnknown } from "@/interface/Iunknown";
import AddLocation from "./AddLocation";

interface LocationPageProps {}

const LocationPage: FC<LocationPageProps> = () => {
  const {
    data: locationData,
    isLoading,
    refetch,
  } = useGetList({
    queryKey: "get-locations",
    endpoint: "/locations",
  });

  const locations = (locationData as any)?.data;

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Boutiques </h2>
        <p className=" text-sm text-slate-500">
          Manage boutiques and their accounts here.
        </p>
      </div>
      <div className="py-4">
        <Suspense fallback={<div>Loading...</div>}>
          <DataList
            columns={getColumns({})}
            data={(locations || []) as any[]}
            state={{ loading: isLoading }}
            filter={{
              options: {},
              filterKey: "company",
            }}
            action={<AddLocation callback={refetch} />}
          />
        </Suspense>
      </div>
    </div>
  );
};
export default LocationPage;
