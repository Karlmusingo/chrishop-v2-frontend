"use client";

import { FC } from "react";

import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import AddProduct from "./AddProduct";

interface ProductsPageProps {}

const ProductsPage: FC<ProductsPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const { data, isLoading, refetch } = useGetList({
    queryKey: "get-products",
    endpoint: "/products",
    filter: { ...getQueryObject() },
  });

  const products = data?.data || [];

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
          state={{ loading: isLoading }}
          filter={{
            options: { tab: [] },
            filterKey: "filter_status",
          }}
          action={<AddProduct callback={refetch} />}
        />
      </div>
    </div>
  );
};

export default ProductsPage;
