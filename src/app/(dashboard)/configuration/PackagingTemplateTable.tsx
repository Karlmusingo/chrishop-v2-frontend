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
import AddPackagingTemplate from "./AddPackagingTemplate";
import EditPackagingTemplate from "./EditPackagingTemplate";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface PackagingTemplate {
  _id: string;
  name: string;
  packagingType: "BALE" | "DOZEN";
  totalItems: number;
  productType: string;
  productBrand: string;
  color: string;
  collarColor?: string;
  sizeDistribution: Array<{ size: string; quantity: number }>;
}

interface PackagingTemplateTableProps {
  items: PackagingTemplate[];
}

const packagingTypeLabels: Record<string, string> = {
  BALE: "Balle",
  DOZEN: "Douzaine",
};

const PackagingTemplateTable: FC<PackagingTemplateTableProps> = ({ items }) => {
  const { mutate: removeMutate, isPending: isRemoving } =
    useMutationWithToast(api.functions.packagingTemplates.remove);
  const [editItem, setEditItem] = useState<PackagingTemplate | null>(null);

  const handleDelete = (item: PackagingTemplate) => {
    removeMutate(
      { id: item._id as any },
      { successMessage: "Modèle supprimé avec succès" }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AddPackagingTemplate />
      </div>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Produit</TableHead>
              <TableHead className="text-center">Couleur</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Distribution</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Aucun modèle d&apos;emballage
                </TableCell>
              </TableRow>
            )}
            {items.map((item) => (
              <TableRow key={item._id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-center">
                  {packagingTypeLabels[item.packagingType] ?? item.packagingType}
                </TableCell>
                <TableCell className="text-center">
                  {item.productType} / {item.productBrand}
                </TableCell>
                <TableCell className="text-center">
                  {item.color}
                  {item.collarColor ? ` (col: ${item.collarColor})` : ""}
                </TableCell>
                <TableCell className="text-center">{item.totalItems}</TableCell>
                <TableCell className="text-center font-mono text-xs">
                  {item.sizeDistribution
                    .map((s) => `${s.size}:${s.quantity}`)
                    .join(", ")}
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

      <EditPackagingTemplate
        item={editItem}
        isOpen={!!editItem}
        onClose={() => setEditItem(null)}
      />
    </div>
  );
};

export default PackagingTemplateTable;
