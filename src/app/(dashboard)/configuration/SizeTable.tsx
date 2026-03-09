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
import AddSize from "./AddSize";
import EditSize from "./EditSize";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface SizeItem {
  _id: string;
  value: string;
  sortOrder?: number;
  ageCategory?: string;
}

interface SizeTableProps {
  sizes: SizeItem[];
}

const ageCategoryLabels: Record<string, string> = {
  adult: "Adulte",
  child: "Enfant",
};

const SizeTable: FC<SizeTableProps> = ({ sizes }) => {
  const { mutate: removeMutate, isPending: isRemoving } =
    useMutationWithToast(api.functions.productSizes.remove);
  const [editItem, setEditItem] = useState<SizeItem | null>(null);

  const handleDelete = (item: SizeItem) => {
    removeMutate(
      { id: item._id as any },
      {
        successMessage: "Taille supprimée avec succès",
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddSize />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Catégorie</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-center">Ordre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Aucun élément
                </TableCell>
              </TableRow>
            )}
            {sizes.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="text-gray-500">
                  {item.ageCategory
                    ? ageCategoryLabels[item.ageCategory] ?? item.ageCategory
                    : "Non défini"}
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

      <EditSize
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </div>
  );
};

export default SizeTable;
