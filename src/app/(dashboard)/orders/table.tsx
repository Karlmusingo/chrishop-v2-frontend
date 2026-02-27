import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { Badge } from "@/components/ui/badge";

type ActionsFuncType = {
  onEdit: (id: string, extraData?: IUnknown) => void;
  onView: (id: string, extraData?: IUnknown) => void;
  onCancel: (id: string, extraData?: IUnknown) => void;
  profile?: IUnknown;
};

export const getColumns = ({ onEdit, onView, onCancel, profile }: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [
    {
      label: "Voir",
      action: (id, _, extraData) => {
        onView(id, extraData);
      },
    },
    {
      label: "Editer",
      disable: (id, extraData) =>
        extraData?.status !== "PENDING" ||
        (profile?.role !== "ADMIN" &&
          extraData.locationId !== profile?.locationId),
      action: (id, _, extraData) => {
        onEdit(id, extraData);
      },
    },
    {
      label: "Annuler",
      disable: (id, extraData) =>
        extraData?.status !== "PENDING" ||
        (profile?.role !== "ADMIN" &&
          extraData.locationId !== profile?.locationId),
      action: (id, _, extraData) => {
        onCancel(id, extraData);
      },
    },
  ];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "#",
      accessorKey: "_id",
      cell: ({ row }) => {
        const rowData = row.original;

        return (
          <button
            className="text-primary underline cursor-pointer hover:opacity-80"
            onClick={() => onView(rowData._id || rowData.id, rowData)}
          >
            {(rowData._id || rowData.id)?.toString().slice(0, 8).toUpperCase()}
          </button>
        );
      },
    },
    {
      header: "Boutique",
      accessorKey: "location",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.location?.name;
      },
    },
    ...(profile?.role === "ADMIN" || profile?.role === "MANAGER"
      ? [
          {
            header: "Vendeur",
            accessorKey: "seller",
            cell: ({ row }: { row: IUnknown }) => {
              const seller = row.original?.seller;
              if (!seller) return "";
              return seller.firstName || seller.lastName
                ? `${seller.firstName ?? ""} ${seller.lastName ?? ""}`.trim()
                : seller.name ?? "";
            },
          },
        ]
      : []),
    {
      header: "Total",
      accessorKey: "totalAmount",
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variantMap: Record<string, "success" | "warning" | "neutral"> = {
          PAID: "success",
          PENDING: "warning",
        };
        const labelMap: Record<string, string> = {
          PAID: "PAYÉ",
          PENDING: "EN ATTENTE",
          CANCEL: "ANNULÉ",
        };
        return (
          <Badge variant={variantMap[status] || "neutral"}>
            {labelMap[status] || status}
          </Badge>
        );
      },
    },
    {
      header: "Date",
      accessorKey: "_creationTime",
      cell: ({ row }) => {
        const rowData = row.original;

        return new Date(rowData._creationTime || rowData.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
      },
    },

    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const rowData = row.original;

        return (
          <Dropdown
            trigger={<Icon name="EllipsisVertical" />}
            title="Action"
            items={actions}
            id={rowData?._id || rowData?.id}
            data={rowData}
          />
        );
      },
    },
  ];

  return columns;
};
