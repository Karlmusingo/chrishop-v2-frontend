import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { Badge } from "@/components/ui/badge";
import { ROLES } from "@/interface/roles";

type ActionsFuncType = {
  onAdd: (id: string, extraData?: IUnknown) => void;
  onTransfer: (id: string, extraData?: IUnknown) => void;
  userRole: ROLES;
};

export const getColumns = ({
  onAdd,
  onTransfer,
  userRole,
}: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
    hide?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [
    {
      label: "Ajouter",
      action: (id, _, extraData) => {
        onAdd(id, extraData);
      },
      hide(id, extraData) {
        return userRole !== ROLES.ADMIN || extraData?.location;
      },
    },
    {
      label: "Transferer",
      action: (id, _, extraData) => {
        onTransfer(id, extraData);
      },
    },
  ];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Boutique",
      accessorKey: "location",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.location?.name || "Depot";
      },
    },
    {
      id: "Type",
      accessorKey: "type",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.type;
      },
    },
    {
      header: "Marque",
      accessorKey: "brand",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.brand;
      },
    },
    {
      header: "Couleur",
      accessorKey: "color",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.color;
      },
    },
    {
      header: "Couleur de colle",
      accessorKey: "collarColor",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.collarColor;
      },
    },
    {
      header: "Taille",
      accessorKey: "size",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.size;
      },
    },
    {
      header: "Prix",
      accessorKey: "price",
    },
    {
      header: "Quantité",
      accessorKey: "quantity",
    },
    {
      header: "Revenu",
      accessorKey: "expectedRevenue",
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variantMap: Record<string, "success" | "warning" | "error"> = {
          IN_STOCK: "success",
          LOW_STOCK: "warning",
          OUT_OF_STOCK: "error",
        };
        const labelMap: Record<string, string> = {
          IN_STOCK: "EN STOCK",
          LOW_STOCK: "STOCK BAS",
          OUT_OF_STOCK: "RUPTURE",
        };
        return (
          <Badge variant={variantMap[status] || "neutral"}>
            {labelMap[status] || status}
          </Badge>
        );
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

type ActionsFuncTypeNewInventory = {};
export const getNewInventoryColums = ({}: ActionsFuncTypeNewInventory) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [
    {
      label: "Delete",
      action: (id, hooks, extraData) => {
        console.log("Delete", id, hooks, extraData);
      },
    },
    {
      label: "Edit",
      action: (id, hooks, extraData) => {
        console.log("Edit", id, hooks, extraData);
      },
    },
  ];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Type",
      accessorKey: "type",
    },
    {
      header: "Marque",
      accessorKey: "brand",
    },
    {
      header: "Couleur",
      accessorKey: "color",
    },
    {
      header: "Couleur de colle",
      accessorKey: "collarColor",
    },
    {
      header: "Taille",
      accessorKey: "size",
    },
    {
      header: "Prix",
      accessorKey: "price",
    },
    {
      header: "Quantité",
      accessorKey: "quantity",
    },
    // {
    //   header: "Revenue",
    //   accessorKey: "expectedRevenue",
    // },

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
