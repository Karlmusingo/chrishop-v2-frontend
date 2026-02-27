"use client";

import { FC, useEffect, useState } from "react";
import { IUnknown } from "@/interface/Iunknown";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import { Input } from "@/components/ui/input";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { DEFAULT_LOW_STOCK_THRESHOLD } from "../../../../convex/constants";

interface EditThresholdModalProps {
  product: IUnknown | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditThresholdModal: FC<EditThresholdModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.products.update
  );

  const [threshold, setThreshold] = useState<string>("");

  useEffect(() => {
    if (product) {
      setThreshold(
        String(product.lowStockThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD)
      );
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const value = Number(threshold);
    if (isNaN(value) || value < 1) return;

    mutate(
      {
        id: product._id as Id<"products">,
        lowStockThreshold: value,
      },
      {
        successMessage: "Seuil de stock mis à jour",
        onSuccess: () => onClose(),
      }
    );
  };

  return (
    <Modal
      title="Modifier le seuil de stock bas"
      description={product?.name ?? ""}
      isOpened={isOpen}
      onClose={onClose}
      classNames={{
        title: "text-lg font-semibold",
        description: "text-sm",
        container: "sm:max-w-[400px]",
      }}
    >
      <form onSubmit={handleSubmit} className="grid gap-4 py-2">
        <div className="grid gap-1.5">
          <label htmlFor="threshold" className="text-sm font-medium">
            Seuil (quantité)
          </label>
          <Input
            id="threshold"
            type="number"
            min={1}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
            placeholder="Ex: 25"
          />
          <p className="text-xs text-muted-foreground">
            En dessous de ce seuil, le produit sera marqué &quot;STOCK
            BAS&quot;. Défaut : {DEFAULT_LOW_STOCK_THRESHOLD}.
          </p>
        </div>
        <Button type="submit" className="w-full" loading={isPending}>
          Enregistrer
        </Button>
      </form>
    </Modal>
  );
};

export default EditThresholdModal;
