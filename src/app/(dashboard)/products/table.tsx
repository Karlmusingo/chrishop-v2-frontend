import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";

type ActionsFuncType = {};

export const getColumns = ({}: ActionsFuncType) => {
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
  ];

  return columns;
};
