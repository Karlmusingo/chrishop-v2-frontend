"use client";

import { FC, useState } from "react";

import { useQueryString } from "@/hooks/useQueryString";
import { useTable } from "@/hooks/useTable";

import { DataList } from "@/components/custom/list/DataList";
import Confirm from "@/components/custom/Confirm";

import { getColumns } from "./table";

import LocationFilter from "@/components/custom/LocationFilter";
import PageHeader from "@/components/custom/PageHeader";
import { IUnknown } from "@/interface/Iunknown";
import AddOrder from "./AddOrder";
import ViewOrder from "./ViewOrder";
import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { Id } from "../../../../convex/_generated/dataModel";

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

  const [onEditModal, setOnEditModal] = useState(false);
  const [onViewModal, setOnViewModal] = useState(false);
  const [orderData, setOrderData] = useState<IUnknown>({});
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);

  const { mutate: cancelOrder, isPending: isCancelling } =
    useMutationWithToast(api.functions.orders.cancel);

  const onCancel = (id: string, extraData?: IUnknown) => {
    setCancelOrderId(id);
    setConfirmCancelOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    try {
      await cancelOrder(
        { id: cancelOrderId as Id<"orders"> },
        {
          successMessage: "Commande annulée avec succès",
          onSuccess: () => {
            setConfirmCancelOpen(false);
            setCancelOrderId(null);
          },
        },
      );
    } catch {
      // error handled by useMutationWithToast
    }
  };

  const {} = useTable({ title: "" });
  return (
    <div>
      <PageHeader title="Ventes" subtitle="Gerez vos commandes ici" />
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
            onCancel,
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
              moveToNext={(data?: IUnknown) => {
                setOnEditModal(false);
                setOnViewModal(true);
                setOrderData(data || {});
              }}
            />
          }
        />
      </div>
      <Confirm
        open={confirmCancelOpen}
        onClose={() => setConfirmCancelOpen(false)}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
        title="Annuler la commande"
        description="Êtes-vous sûr de vouloir annuler cette commande ? Le stock sera libéré."
      />
    </div>
  );
};

export default OrdersPage;
