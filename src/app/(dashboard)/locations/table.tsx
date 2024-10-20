import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { UserRoles } from "@/interface/roles";

type ActionsFuncType = {};

export const getColumns = ({}: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
    hide?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Nom",
      accessorKey: "name",
    },
    {
      header: "Province",
      accessorKey: "province",
    },
    {
      header: "Ville",
      accessorKey: "city",
    },
    {
      header: "Adresse",
      accessorKey: "address",
    },
    {
      header: "Email",
      accessorKey: "contactEmail",
    },
    {
      header: "Numero",
      accessorKey: "contactPhoneNumber",
    },
    {
      header: "Status",
      accessorKey: "status",
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

export const filterOptions = Object.values(UserRoles).filter((key) => key);
