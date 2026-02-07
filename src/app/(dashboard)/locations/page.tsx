"use client";

import { FC, Suspense } from "react";

import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { filterOptions, getColumns } from "./table";
import AddLocation from "./AddLocation";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface LocationPageProps {}

const LocationPage: FC<LocationPageProps> = () => {
  const locations = useQuery(api.functions.locations.list, {}) ?? [];

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
            state={{ loading: locations === undefined }}
            filter={{
              options: {},
              filterKey: "company",
            }}
            action={<AddLocation />}
          />
        </Suspense>
      </div>
    </div>
  );
};
export default LocationPage;
