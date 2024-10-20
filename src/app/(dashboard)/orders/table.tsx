import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";

type ActionsFuncType = {
  onEdit: (id: string, extraData?: IUnknown) => void;
  onView: (id: string, extraData?: IUnknown) => void;
};

export const getColumns = ({ onEdit, onView }: ActionsFuncType) => {
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
      disable: (id, extraData) => extraData?.status !== "PENDING",
      action: (id, _, extraData) => {
        onEdit(id, extraData);
      },
    },
  ];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "#",
      accessorKey: "id",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.id?.slice(0, 8);
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
    {
      header: "Total",
      accessorKey: "totalAmount",
    },
    {
      header: "Statut",
      accessorKey: "status",
    },
    {
      header: "Date",
      accessorKey: "createdAt",
      cell: ({ row }) => {
        const rowData = row.original;

        return new Date(rowData.createdAt).toLocaleDateString();
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
