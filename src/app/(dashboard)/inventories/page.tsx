"use client";

import { FC, useState } from "react";

import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import AddInventory from "./AddInventory";
import LocationFilter from "@/components/custom/LocationFilter";
import TransferInventory from "./TransferInventory";
import { IUnknown } from "@/interface/Iunknown";
import AddExistingInventory from "./AddExistingInventory";
import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";

interface InventoriesPageProps {}

const InventoriesPage: FC<InventoriesPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const { data, isLoading, refetch } = useGetList({
    queryKey: "get-inventories",
    endpoint: "/inventories",
    filter: { ...getQueryObject() },
  });
  const [transferModalOpened, setTransferOpened] = useState(false);
  const [addExistingModalOpened, setAddExistingOpened] = useState(false);
  const [inventoryData, setInventoryData] = useState<IUnknown>({});

  const { userRole } = usePermission();
  const { data: productData } = useGetList({
    queryKey: "get-products",
    endpoint: "/products",
  });

  const { data: locationData } = useGetList({
    queryKey: "get-locations",
    endpoint: "/locations",
  });

  const inventories = data?.data || [];
  const products = productData?.data || [];
  const locations = locationData?.data || [];

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Inventories</h2>
        <p className=" text-sm text-slate-500">Manage the Inventories here</p>
      </div>
      {userRole === ROLES.ADMIN && (
        <div className="flex gap-4 mt-12">
          <LocationFilter />
        </div>
      )}

      <TransferInventory
        callback={refetch}
        locations={locations}
        inventoryData={inventoryData}
        isOpen={transferModalOpened}
        onClose={() => setTransferOpened(false)}
      />

      <AddExistingInventory
        callback={refetch}
        inventoryData={inventoryData}
        isOpen={addExistingModalOpened}
        onClose={() => setAddExistingOpened(false)}
      />
      <div className="py-4">
        <DataList
          columns={getColumns({
            userRole,
            onAdd(id, extraData) {
              setAddExistingOpened(true);
              setInventoryData(extraData || {});
            },
            onTransfer(id, extraData) {
              setTransferOpened(true);
              setInventoryData(extraData || {});
            },
          })}
          data={(inventories || []) as any[]}
          state={{ loading: isLoading }}
          filter={{
            options: { tab: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] },
            filterKey: "status",
          }}
          action={<AddInventory products={products} callback={refetch} />}
        />
      </div>
    </div>
  );
};

export default InventoriesPage;
