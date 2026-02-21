"use client";

import { FC, Suspense } from "react";

import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { filterOptions, getColumns } from "./table";
import AddLocation from "./AddLocation";
import PageHeader from "@/components/custom/PageHeader";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface LocationPageProps {}

const LocationPage: FC<LocationPageProps> = () => {
  const locations = useQuery(api.functions.locations.list, {}) ?? [];

  const {} = useTable({ title: "" });
  return (
    <div>
      <PageHeader title="Boutiques" subtitle="Gerez vos boutiques et leurs comptes" />
      <div className="py-4">
        <Suspense fallback={<div>Chargement...</div>}>
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
