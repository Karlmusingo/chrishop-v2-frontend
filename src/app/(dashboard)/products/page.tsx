"use client";

import { FC, useEffect, useState } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";
import { useMetaStore } from "@/hooks/zustand/useMetaStore";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import AddProduct from "./AddProduct";
import PageHeader from "@/components/custom/PageHeader";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import EditThresholdModal from "./EditThresholdModal";
import { IUnknown } from "@/interface/Iunknown";

interface ProductsPageProps {}

const ProductsPage: FC<ProductsPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const queryObj = getQueryObject();

  const page = Number(queryObj.page) || 1;
  const perPage = Number(queryObj.perPage) || 10;

  const result = useQuery(api.functions.products.list, {
    search: queryObj.search as string | undefined,
    type: queryObj.type as string | undefined,
    brand: queryObj.brand as string | undefined,
    code: queryObj.code as string | undefined,
    color: queryObj.color as string | undefined,
    size: queryObj.size as string | undefined,
    page,
    perPage,
  });

  const { setData } = useMetaStore();

  useEffect(() => {
    if (result?.meta) {
      setData(result.meta as any);
    }
  }, [result?.meta, setData]);

  const [thresholdProduct, setThresholdProduct] = useState<IUnknown | null>(
    null
  );

  const {} = useTable({ title: "" });
  return (
    <div>
      <PageHeader title="Produits" subtitle="Gerez vos produits ici" />

      <div className="py-4">
        <DataList
          columns={getColumns({
            onEditThreshold: (_id, extraData) => {
              setThresholdProduct(extraData ?? null);
            },
          })}
          data={(result?.data || []) as any[]}
          state={{ loading: result === undefined }}
          filter={{
            options: { tab: [] },
            filterKey: "filter_status",
          }}
          action={<AddProduct />}
        />
      </div>

      <EditThresholdModal
        product={thresholdProduct}
        isOpen={!!thresholdProduct}
        onClose={() => setThresholdProduct(null)}
      />
    </div>
  );
};

export default ProductsPage;
