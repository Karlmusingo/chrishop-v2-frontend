import { IUnknown } from "@/interface/Iunknown";
import { ColumnDef } from "@tanstack/react-table";
import Dropdown from "@/components/custom/dropdown/Dropdown";
import Icon from "@/components/custom/Icon";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "../../../../convex/constants";

type ActionsFuncType = {
  onEditThreshold: (id: string, extraData?: IUnknown) => void;
};

export const getColumns = ({ onEditThreshold }: ActionsFuncType) => {
  const actions: {
    label: string;
    action?: (id: string, hooks?: IUnknown, extraData?: IUnknown) => void;
  }[] = [
    {
      label: "Modifier seuil",
      action: (id, _, extraData) => {
        onEditThreshold(id, extraData);
      },
    },
  ];

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
      header: "Code",
      accessorKey: "code",
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
      header: "Seuil stock",
      accessorKey: "lowStockThreshold",
      cell: ({ row }) => {
        const rowData = row.original;
        const threshold = rowData.lowStockThreshold;
        const isDefault = threshold === undefined || threshold === null;
        return (
          <span>
            {isDefault ? DEFAULT_LOW_STOCK_THRESHOLD : threshold}
            {isDefault && (
              <span className="ml-1 text-xs text-muted-foreground">
                (défaut)
              </span>
            )}
          </span>
        );
      },
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
            id={rowData?._id || rowData?.id}
            data={rowData}
          />
        );
      },
    },
  ];

  return columns;
};
