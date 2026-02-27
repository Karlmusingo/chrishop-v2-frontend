"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useState } from "react";

import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useConvex, useQuery } from "convex/react";

import { DialogFooter } from "@/components/ui/dialog";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  bulkTransferIndividualSchema,
  BulkTransferIndividualSchemaType,
} from "@/schemas/inventories/bulkTransferInventory.schema";
import {
  bulkTransferPackagingSchema,
  BulkTransferPackagingSchemaType,
} from "@/schemas/inventories/bulkTransferPackaging.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";

interface BulkTransferInventoryProps {
  callback?: () => void;
}

type TransferItem = {
  productId: string;
  type: string;
  brand: string;
  code?: string;
  color?: string;
  size?: string;
  collarColor?: string;
  transferQuantity: number;
  availableQuantity: number;
};

type TransferMode = "individual" | "packaging";

const BulkTransferInventory: FC<BulkTransferInventoryProps> = ({
  callback,
}) => {
  const convex = useConvex();
  const { mutate, isPending } = useMutationWithToast(
    api.functions.inventories.bulkTransfer
  );
  const { userRole } = usePermission();
  const { typeOptions, brandOptions, colorOptions, sizeOptions } =
    useProductAttributes();

  const locations = useQuery(api.functions.locations.list, {}) ?? [];
  const packagingTemplates =
    useQuery(api.functions.packagingTemplates.list, {}) ?? [];

  const [isOpened, setOpened] = useState(false);
  const [items, setItems] = useState<TransferItem[]>([]);
  const [mode, setMode] = useState<TransferMode>("individual");
  const [sourceLocationId, setSourceLocationId] = useState<string | null>(null);
  const [destinationLocationId, setDestinationLocationId] = useState<
    string | null
  >(null);

  const form = useForm<BulkTransferIndividualSchemaType>({
    resolver: zodResolver(bulkTransferIndividualSchema),
  });
  const typeValue = form.watch("type");

  const packagingForm = useForm<BulkTransferPackagingSchemaType>({
    resolver: zodResolver(bulkTransferPackagingSchema),
    defaultValues: {
      // @ts-ignore
      numberOfPackages: "1",
    },
  });

  function callbackOnSuccess() {
    form.reset();
    packagingForm.reset();
    setOpened(false);
    setItems([]);
    setSourceLocationId(null);
    setDestinationLocationId(null);
    callback?.();
  }

  const getSourceLocationIdForQuery = () => {
    if (!sourceLocationId || sourceLocationId === "depot") return undefined;
    return sourceLocationId;
  };

  const handleSubmit = () => {
    if (!sourceLocationId) {
      toast.error("Veuillez sélectionner une source");
      return;
    }
    if (!destinationLocationId) {
      toast.error("Veuillez sélectionner une destination");
      return;
    }
    if (items.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    mutate(
      {
        items: items.map((item) => ({
          productId: item.productId as any,
          quantity: item.transferQuantity,
        })),
        sourceLocationId: getSourceLocationIdForQuery() as any,
        destinationLocationId: destinationLocationId as any,
      },
      {
        successMessage: "Transfert effectué avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  async function onAddTransferItem(values: BulkTransferIndividualSchemaType) {
    if (!sourceLocationId) {
      toast.error("Veuillez sélectionner une source");
      return;
    }

    const sourceLocId = getSourceLocationIdForQuery();

    const inventory = await convex.query(
      api.functions.inventories.findByProductAttributesAtSource,
      {
        type: values.type,
        brand: values.brand,
        ...(values.code ? { code: values.code } : {}),
        ...(values.color ? { color: values.color } : {}),
        ...(values.size ? { size: values.size } : {}),
        ...(typeValue?.includes("polo") && values.collarColor
          ? { collarColor: values.collarColor }
          : {}),
        locationId: sourceLocId as any,
      }
    );

    if (!inventory || inventory.quantity <= 0) {
      toast.error("Ce produit n'a pas d'inventaire à cette source");
      return;
    }

    if (items.find((item) => item.productId === inventory.productId)) {
      toast.error("Ce produit est déjà dans la liste");
      return;
    }

    if (inventory.quantity < values.transferQuantity) {
      toast.error(
        "Quantité insuffisante, quantité disponible: " + inventory.quantity
      );
      return;
    }

    form.reset();

    setItems([
      ...items,
      {
        type: values.type,
        brand: values.brand,
        code: values.code,
        color: values.color,
        size: values.size,
        collarColor: values.collarColor,
        productId: inventory.productId,
        transferQuantity: values.transferQuantity,
        availableQuantity: inventory.quantity,
      },
    ]);
  }

  async function onAddPackagingTransfer(
    values: BulkTransferPackagingSchemaType
  ) {
    if (!sourceLocationId) {
      toast.error("Veuillez sélectionner une source");
      return;
    }

    try {
      const sourceLocId = getSourceLocationIdForQuery();

      const result = await convex.query(
        api.functions.packagingTemplates.expandToItems,
        {
          templateId: values.templateId as any,
          numberOfPackages: values.numberOfPackages,
          locationId: sourceLocId as any,
          checkInventory: true,
        }
      );

      if (result.missingProducts.length > 0) {
        toast.error(
          `Produits manquants: ${result.missingProducts.join(", ")}`
        );
        return;
      }

      if (result.insufficientStock.length > 0) {
        const details = result.insufficientStock
          .map(
            (s: any) =>
              `${s.size}: ${s.available}/${s.required} disponible(s)`
          )
          .join(", ");
        toast.error(`Stock insuffisant - ${details}`);
        return;
      }

      // Check for duplicates
      const duplicates = result.items.filter((item: any) =>
        items.find((existing) => existing.productId === item.productId)
      );
      if (duplicates.length > 0) {
        toast.error(
          `Certains produits sont déjà dans la liste: ${duplicates.map((d: any) => d.size).join(", ")}`
        );
        return;
      }

      const newItems: TransferItem[] = result.items.map((item: any) => ({
        type: item.type,
        brand: item.brand,
        color: item.color,
        size: item.size,
        collarColor: item.collarColor,
        productId: item.productId,
        transferQuantity: item.quantity,
        availableQuantity: item.availableQuantity ?? 0,
      }));

      setItems([...items, ...newItems]);
      packagingForm.reset();
      // @ts-ignore
      packagingForm.setValue("numberOfPackages", "1");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'expansion du modèle");
    }
  }

  const handleRemoveItem = (index: number) => {
    const updated = [...items];
    updated.splice(index, 1);
    setItems(updated);
  };

  const handleEditItem = (index: number) => {
    const updated = [...items];
    const item = updated[index];

    form.setValue("type", item.type);
    form.setValue("brand", item.brand);
    form.setValue("code", item.code);
    form.setValue("color", item.color);
    form.setValue("size", item.size);
    form.setValue("collarColor", item.collarColor);
    // @ts-ignore
    form.setValue("transferQuantity", item.transferQuantity.toString());

    updated.splice(index, 1);
    setItems(updated);
    setMode("individual");
  };

  const templateOptions = packagingTemplates.map((t: any) => ({
    label: `${t.name} (${t.packagingType === "BALE" ? "Balle" : "Douzaine"} - ${t.totalItems} pcs)`,
    value: t._id,
  }));

  const sourceLocationOptions = [
    { label: "Depot", value: "depot" },
    ...locations
      .filter((loc: any) => loc._id !== destinationLocationId)
      .map((loc: any) => ({
        label: loc.name,
        value: loc._id,
      })),
  ];

  const destinationLocationOptions = locations
    .filter((loc: any) => {
      if (sourceLocationId === "depot") return true;
      return loc._id !== sourceLocationId;
    })
    .map((loc: any) => ({
      label: loc.name,
      value: loc._id,
    }));

  return (
    <Modal
      title="Transfert"
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
      }}
      trigger={
        userRole === ROLES.ADMIN && (
          <Button
            icon="ArrowRightLeft"
            type="button"
            variant="outline"
            onClick={() => setOpened(true)}
          >
            Transfert
          </Button>
        )
      }
    >
      {/* Source and Destination selectors */}
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div className="grid gap-1">
          <Label>Source</Label>
          <SelectUI
            value={sourceLocationId ?? undefined}
            onValueChange={(val) => {
              setSourceLocationId(val);
              setItems([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la source" />
            </SelectTrigger>
            <SelectContent>
              {sourceLocationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectUI>
        </div>
        <div className="grid gap-1">
          <Label>Destination</Label>
          <SelectUI
            value={destinationLocationId ?? undefined}
            onValueChange={(val) => {
              setDestinationLocationId(val);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez la destination" />
            </SelectTrigger>
            <SelectContent>
              {destinationLocationOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectUI>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-[#F8F8F8] p-1">
        <button
          type="button"
          onClick={() => setMode("individual")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "individual"
              ? "bg-white text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Individuel
        </button>
        <button
          type="button"
          onClick={() => setMode("packaging")}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "packaging"
              ? "bg-white text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Emballage
        </button>
      </div>

      {mode === "individual" ? (
        <Form {...form}>
          <form
            className="grid gap-4 py-4 rounded-lg border p-6"
            onSubmit={form.handleSubmit(onAddTransferItem)}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1">
                <SelectInput
                  control={form.control}
                  name="type"
                  label="Type"
                  placeholder="Sélectionnez un type"
                  options={typeOptions}
                />
              </div>
              <div className="grid gap-1">
                <SelectInput
                  control={form.control}
                  name="brand"
                  label="Marque"
                  placeholder="Sélectionnez une marque"
                  options={brandOptions}
                />
              </div>
            </div>

            <div className="grid gap-1">
              <Input
                control={form.control}
                name="code"
                label="Code"
                placeholder="Entrez le code du produit"
              />
            </div>

            <div
              className={`grid gap-4${typeValue?.includes("polo") ? " grid-cols-2" : ""}`}
            >
              <div className="grid gap-1">
                <SelectInput
                  control={form.control}
                  name="color"
                  label="Couleur"
                  placeholder="Sélectionnez les couleurs"
                  options={colorOptions}
                />
              </div>
              {typeValue?.includes("polo") && (
                <div className="grid gap-1">
                  <SelectInput
                    control={form.control}
                    name="collarColor"
                    label="Couleur de la colle"
                    placeholder="Sélectionnez les couleurs"
                    options={colorOptions}
                  />
                </div>
              )}
            </div>

            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="size"
                label="Taille"
                placeholder="Sélectionnez les tailles"
                options={sizeOptions}
              />
            </div>

            <div className="mb-2 grid gap-1">
              <Input
                control={form.control}
                name="transferQuantity"
                label="Quantité à transférer"
                type="number"
                placeholder="Entrez la quantité"
              />
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Ajouter
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...packagingForm}>
          <form
            className="grid gap-4 py-4 rounded-lg border p-6"
            onSubmit={packagingForm.handleSubmit(onAddPackagingTransfer)}
          >
            <div className="grid gap-1">
              <SelectInput
                control={packagingForm.control}
                name="templateId"
                label="Modèle d'emballage"
                placeholder="Sélectionnez un modèle"
                options={templateOptions}
              />
            </div>

            <div className="grid gap-1">
              <Input
                control={packagingForm.control}
                name="numberOfPackages"
                label="Nombre d'emballages"
                type="number"
                placeholder="1"
              />
            </div>

            <Button type="submit" className="w-full" loading={isPending}>
              Ajouter les articles
            </Button>
          </form>
        </Form>
      )}

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Marque</TableHead>
              <TableHead className="text-center">Couleur</TableHead>
              <TableHead className="text-center">Taille</TableHead>
              <TableHead className="text-center">Disponible</TableHead>
              <TableHead className="text-center">À transférer</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  Aucun article ajouté
                </TableCell>
              </TableRow>
            )}
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell className="text-center">{item.type}</TableCell>
                <TableCell className="text-center">{item.brand}</TableCell>
                <TableCell className="text-center">
                  {item.color || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {item.size || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {item.availableQuantity}
                </TableCell>
                <TableCell className="text-center">
                  {item.transferQuantity}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => handleEditItem(index)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => handleRemoveItem(index)}
                  >
                    <Trash className="text-red-500" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <div className="flex gap-2">
          <Button
            className="w-full"
            loading={isPending}
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              packagingForm.reset();
              setItems([]);
            }}
          >
            Annuler
          </Button>
        </div>
      </DialogFooter>
    </Modal>
  );
};

export default BulkTransferInventory;
