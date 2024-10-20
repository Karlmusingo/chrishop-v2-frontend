"use client";

import { FC, Suspense } from "react";

import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";
import { useSearch } from "@/hooks/useSearch";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { filterOptions, getColumns } from "./table";
import { RolesList, UserRoles } from "@/interface/roles";
import AddUser from "./AddUser";

interface UsersPageProps {}

const UsersPage: FC<UsersPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const filters = getQueryObject(["role", "status", "countryId"]);
  const { data, isLoading, error, refetch } = useGetList({
    queryKey: "get-users",
    endpoint: "/users",
    filter: {
      ...filters,
    },
  });
  const users = data?.data;

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Users </h2>
        <p className=" text-sm text-slate-500">
          Manage users and their accounts here.
        </p>
      </div>
      <div className="py-4">
        <Suspense fallback={<div>Loading...</div>}>
          <DataList
            columns={getColumns({})}
            data={(users || []) as any[]}
            state={{ loading: isLoading }}
            filter={{
              options: { tab: filterOptions },
              filterKey: "role",
            }}
            action={<AddUser callback={refetch} />}
          />
        </Suspense>
      </div>
    </div>
  );
};
export default UsersPage;
