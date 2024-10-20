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
  }[] = [];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Name",
      cell: ({ row }) => {
        const rowData = row.original;

        return `${rowData?.firstName} ${rowData?.lastName}`;
      },
    },
    {
      header: "Email",
      accessorKey: "email",
    },
    {
      header: "Phone Number",
      accessorKey: "phoneNumber",
    },
    {
      header: "Location",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.location ? rowData?.location?.name : "";
      },
    },
    {
      header: "Role",
      accessorKey: "role",
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
