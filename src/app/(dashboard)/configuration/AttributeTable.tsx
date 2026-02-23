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
import AddAttribute from "./AddAttribute";
import EditAttribute from "./EditAttribute";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { FunctionReference } from "convex/server";

interface AttributeItem {
  _id: string;
  label: string;
  value: string;
  sortOrder?: number;
}

interface AttributeTableProps {
  categoryLabel: string;
  items: AttributeItem[];
  createMutation: FunctionReference<"mutation", "public", any, any>;
  updateMutation: FunctionReference<"mutation", "public", any, any>;
  removeMutation: FunctionReference<"mutation", "public", any, any>;
}

const AttributeTable: FC<AttributeTableProps> = ({
  categoryLabel,
  items,
  createMutation,
  updateMutation,
  removeMutation,
}) => {
  const { mutate: removeMutate, isPending: isRemoving } =
    useMutationWithToast(removeMutation);
  const [editItem, setEditItem] = useState<AttributeItem | null>(null);

  const handleDelete = (item: AttributeItem) => {
    removeMutate(
      { id: item._id as any },
      {
        successMessage: `${categoryLabel} supprimé avec succès`,
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddAttribute
          categoryLabel={categoryLabel}
          createMutation={createMutation}
        />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead className="text-center">Ordre</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-gray-500">
                  Aucun élément
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.label}</TableCell>
                <TableCell className="font-mono text-sm">
                  {item.value}
                </TableCell>
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

      <EditAttribute
        categoryLabel={categoryLabel}
        updateMutation={updateMutation}
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </div>
  );
};

export default AttributeTable;
