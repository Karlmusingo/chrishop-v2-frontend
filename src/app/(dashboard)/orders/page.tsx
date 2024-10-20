"use client";

import { FC, useState } from "react";

import { useGetList } from "@/hooks/api/common/getAll";
import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";

import { getColumns } from "./table";

import LocationFilter from "@/components/custom/LocationFilter";
import { IUnknown } from "@/interface/Iunknown";
import AddOrder from "./AddOrder";
import { useGetProfile } from "@/hooks/api/users/profile";
import ViewOrder from "./ViewOrder";

interface OrdersPageProps {}

const OrdersPage: FC<OrdersPageProps> = () => {
  const { getQueryObject } = useQueryString();
  const { data, isLoading, refetch } = useGetList({
    queryKey: "get-orders",
    endpoint: "/orders",
    filter: { ...getQueryObject() },
  });
  const [onEditModal, setOnEditModal] = useState(false);
  const [onViewModal, setOnViewModal] = useState(false);
  const [orderData, setOrderData] = useState<IUnknown>({});

  const { data: profileData } = useGetProfile();
  const { data: inventoryData } = useGetList({
    queryKey: "get-inventories",
    endpoint: "/inventories",
    filter: { location: profileData?.locationId },
  });

  const orders = data?.data || [];
  const inventories = inventoryData?.data || [];

  const {} = useTable({ title: "" });
  return (
    <div>
      <div>
        <h2 className=" text-[1.2em] font-semibold">Ventes</h2>
        <p className=" text-sm text-slate-500">Manage the orders here</p>
      </div>
      <div className="flex gap-4 mt-12">
        <LocationFilter depot={false} />
      </div>

      <ViewOrder
        callback={refetch}
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
          state={{ loading: isLoading }}
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
              callback={() => {
                refetch();
              }}
              moveToNext={() => {
                setOnEditModal(false);
                setOnViewModal(true);
              }}
            />
          }
        />
      </div>
    </div>
  );
};

export default OrdersPage;
