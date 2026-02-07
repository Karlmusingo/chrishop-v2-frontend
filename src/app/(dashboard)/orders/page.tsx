"use client";

import { FC, useState } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import LocationFilter from "@/components/custom/LocationFilter";
import { IUnknown } from "@/interface/Iunknown";
import AddOrder from "./AddOrder";
import ViewOrder from "./ViewOrder";
import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

interface OrdersPageProps {}

const OrdersPage: FC<OrdersPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const queryObj = getQueryObject();
  const { userRole, data: profileData } = usePermission();

  const orders =
    useQuery(api.functions.orders.list, {
      location: queryObj.location as string | undefined,
      userLocationId: profileData?.locationId,
      userRole: userRole,
    }) ?? [];

  const inventories =
    useQuery(api.functions.inventories.list, {
      location: profileData?.locationId as string | undefined,
      userLocationId: profileData?.locationId,
      userRole: userRole,
    }) ?? [];

  const [onEditModal, setOnEditModal] = useState(false);
  const [onViewModal, setOnViewModal] = useState(false);
  const [orderData, setOrderData] = useState<IUnknown>({});

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Ventes</h2>
        <p className=" text-sm text-slate-500">Manage the orders here</p>
      </div>
      {userRole === ROLES.ADMIN && (
        <div className="flex gap-4 mt-12">
          <LocationFilter depot={false} />
        </div>
      )}

      <ViewOrder
        orderData={orderData}
        isOpen={onViewModal}
        onClose={() => {
          setOnViewModal(false);
          setOrderData({});
        }}
      />
      <div className="py-4">
        <DataList
          columns={getColumns({
            profile: profileData,
            onEdit(id, extraData) {
              setOnEditModal(true);
              setOrderData(extraData || {});
            },
            onView(id, extraData) {
              setOnViewModal(true);
              setOrderData(extraData || {});
            },
          })}
          data={(orders || []) as any[]}
          state={{ loading: orders === undefined }}
          filter={{
            options: { tab: [] },
            filterKey: "filter_status",
          }}
          action={
            <AddOrder
              orderData={onEditModal ? orderData : undefined}
              isOpen={onEditModal}
              setIsOpen={(open: boolean) => {
                setOrderData({});
                setOnEditModal(open);
              }}
              inventories={inventories}
              moveToNext={(data?: IUnknown) => {
                setOnEditModal(false);
                setOnViewModal(true);
                setOrderData(data || {});
              }}
            />
          }
        />
      </div>
    </div>
  );
};

export default OrdersPage;
