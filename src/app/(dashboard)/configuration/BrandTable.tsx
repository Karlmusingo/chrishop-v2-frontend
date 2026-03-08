"use client";

import { FC, useState } from "react";
import { Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Button from "@/components/custom/Button";
import AddBrand from "./AddBrand";
import EditBrand from "./EditBrand";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface BrandItem {
  _id: string;
  value: string;
  sortOrder?: number;
  typeId?: string;
  typeName?: string;
}

interface BrandTableProps {
  brands: BrandItem[];
  typeOptions: { label: string; value: string }[];
}

const BrandTable: FC<BrandTableProps> = ({ brands, typeOptions }) => {
  const { mutate: removeMutate, isPending: isRemoving } =
    useMutationWithToast(api.functions.productBrands.remove);
  const [editItem, setEditItem] = useState<BrandItem | null>(null);

  const handleDelete = (item: BrandItem) => {
    removeMutate(
      { id: item._id as any },
      {
        successMessage: "Marque supprimée avec succès",
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddBrand typeOptions={typeOptions} />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-center">Ordre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Aucun élément
                </TableCell>
              </TableRow>
            )}
            {brands.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="text-gray-500">
                  {item.typeName ?? "Non défini"}
                </TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell className="text-center">
                  {item.sortOrder ?? "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => setEditItem(item)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    disabled={isRemoving}
                    onClick={() => handleDelete(item)}
                  >
                    <Trash className="text-red-500" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBrand
        typeOptions={typeOptions}
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </div>
  );
};

export default BrandTable;
