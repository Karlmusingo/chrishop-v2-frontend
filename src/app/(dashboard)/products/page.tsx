"use client";

import { FC } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import AddProduct from "./AddProduct";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface ProductsPageProps {}

const ProductsPage: FC<ProductsPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const queryObj = getQueryObject();

  const products =
    useQuery(api.functions.products.list, {
      search: queryObj.search as string | undefined,
      type: queryObj.type as string | undefined,
      brand: queryObj.brand as string | undefined,
      color: queryObj.color as string | undefined,
      size: queryObj.size as string | undefined,
    }) ?? [];

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Products</h2>
        <p className=" text-sm text-slate-500">Manage the products here</p>
      </div>

      <div className="py-4">
        <DataList
          columns={getColumns({})}
          data={(products || []) as any[]}
          state={{ loading: products === undefined }}
          filter={{
            options: { tab: [] },
            filterKey: "filter_status",
          }}
          action={<AddProduct />}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
