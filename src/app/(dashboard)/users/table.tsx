import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { Badge } from "@/components/ui/badge";
import { UserRoles } from "@/interface/roles";

type ActionsFuncType = {
  onResetPassword: (id: string, extraData?: IUnknown) => void;
};

export const getColumns = ({ onResetPassword }: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
    disable?: (id: string, extraData?: IUnknown) => boolean;
  }[] = [
    {
      label: "Réinitialiser le mot de passe",
      action: (id, _hooks, extraData) => onResetPassword(id, extraData),
    },
  ];

  const columns: ColumnDef<IUnknown>[] = [
    {
      header: "Nom",
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
      header: "Téléphone",
      accessorKey: "phoneNumber",
    },
    {
      header: "Boutique",
      cell: ({ row }) => {
        const rowData = row.original;

        return rowData.location ? rowData?.location?.name : "";
      },
    },
    {
      header: "Rôle",
      accessorKey: "role",
      cell: ({ row }) => {
        const role = row.original.role;
        return <Badge variant="neutral">{role}</Badge>;
      },
    },
    {
      header: "Statut",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original.status;
        const variantMap: Record<string, "success" | "warning" | "neutral"> = {
          active: "success",
          inactive: "neutral",
        };
        return (
          <Badge variant={variantMap[status] || "neutral"}>
            {status === "active" ? "ACTIF" : status === "inactive" ? "INACTIF" : status}
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

export const filterOptions = Object.values(UserRoles).filter((key) => key);
