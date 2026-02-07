"use client";

import { FC, Suspense } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { filterOptions, getColumns } from "./table";
import AddUser from "./AddUser";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface UsersPageProps {}

const UsersPage: FC<UsersPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const filters = getQueryObject(["role", "status"]);

  const users =
    useQuery(api.functions.users.list, {
      role: filters.role as any,
      status: filters.status as any,
      search: filters.search as string | undefined,
    }) ?? [];

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
            state={{ loading: users === undefined }}
            filter={{
              options: { tab: filterOptions },
              filterKey: "role",
            }}
            action={<AddUser />}
          />
        </Suspense>
      </div>
    </div>
  );
};
export default UsersPage;
