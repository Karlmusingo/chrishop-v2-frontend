import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { Badge } from "@/components/ui/badge";

type ActionsFuncType = {
  onAdd: (id: string, extraData?: IUnknown) => void;
  onTransfer: (id: string, extraData?: IUnknown) => void;
};

export const getColumns = ({ onAdd, onTransfer }: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [
    {
      label: "Ajouter",
      action: (id, _, extraData) => {
        onAdd(id, extraData);
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

        return rowData.location?.name;
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
      header: "Brand",
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
      header: "Taille",
      accessorKey: "size",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.product?.size;
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
      header: "Prix",
      accessorKey: "price",
    },
    {
      header: "Quantité",
      accessorKey: "quantity",
    },
    {
      header: "Revenue",
      accessorKey: "expectedRevenue",
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => {
        const rowData = row.original;

        if (["LOW_STOCK", "OUT_OF_STOCK"].includes(rowData.status)) {
          return <Badge variant="destructive">{rowData.status}</Badge>;
        }

        return rowData.status;
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
            id={rowData?.id}
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
      header: "Brand",
      accessorKey: "brand",
    },
    {
      header: "Couleur",
      accessorKey: "color",
    },
    {
      header: "Taille",
      accessorKey: "size",
    },
    {
      header: "Couleur de colle",
      accessorKey: "collarColor",
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
            id={rowData?.id}
            data={rowData}
          />
        );
      },
    },
  ];

  return columns;
};
