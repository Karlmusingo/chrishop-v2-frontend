import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

import { UserRoles } from "@/interface/roles";

type ActionsFuncType = {};

export const getColumns = ({}: ActionsFuncType) => {
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
  ];

  return columns;
};

export const filterOptions = Object.values(UserRoles).filter((key) => key);
