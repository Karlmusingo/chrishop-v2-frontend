import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";

type ActionsFuncType = {};

export const getColumns = ({}: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Nom",
      accessorKey: "name",
    },
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
      header: "Description",
      accessorKey: "description",
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
