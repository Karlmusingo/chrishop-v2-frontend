"use client";

import { FC, useState } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import AddInventory from "./AddInventory";
import LocationFilter from "@/components/custom/LocationFilter";
import PageHeader from "@/components/custom/PageHeader";
import TransferInventory from "./TransferInventory";
import { IUnknown } from "@/interface/Iunknown";
import AddExistingInventory from "./AddExistingInventory";
import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface InventoriesPageProps {}

const InventoriesPage: FC<InventoriesPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const queryObj = getQueryObject();
  const { userRole, data: profileData } = usePermission();

  const inventories =
    useQuery(api.functions.inventories.list, {
      search: queryObj.search as string | undefined,
      type: queryObj.type as string | undefined,
      brand: queryObj.brand as string | undefined,
      color: queryObj.color as string | undefined,
      size: queryObj.size as string | undefined,
      status: queryObj.status as string | undefined,
      location: queryObj.location as string | undefined,
      userLocationId: profileData?.locationId,
      userRole: userRole,
    }) ?? [];

  const locations = useQuery(api.functions.locations.list, {}) ?? [];

  const [transferModalOpened, setTransferOpened] = useState(false);
  const [addExistingModalOpened, setAddExistingOpened] = useState(false);
  const [inventoryData, setInventoryData] = useState<IUnknown>({});

  const {} = useTable({ title: "" });
  return (
    <div>
      <PageHeader title="Inventaire" subtitle="Gerez le stock de vos boutiques" />
      {userRole === ROLES.ADMIN && (
        <div className="flex gap-4 mt-12">
          <LocationFilter />
        </div>
      )}

      <TransferInventory
        locations={locations}
        inventoryData={inventoryData}
        isOpen={transferModalOpened}
        onClose={() => setTransferOpened(false)}
      />

      <AddExistingInventory
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
          state={{ loading: inventories === undefined }}
          filter={{
            options: { tab: ["IN_STOCK", "LOW_STOCK", "OUT_OF_STOCK"] },
            filterKey: "status",
          }}
          action={<AddInventory />}
        />
      </div>
    </div>
  );
};

export default InventoriesPage;
