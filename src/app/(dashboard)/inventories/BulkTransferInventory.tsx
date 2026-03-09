"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useEffect, useMemo, useState } from "react";

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
import SizeDistributionGrid from "@/components/custom/SizeDistributionGrid";
import FormErrorAlert from "@/components/custom/FormErrorAlert";

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
    api.functions.inventories.bulkTransfer,
  );
  const { userRole } = usePermission();
  const { types, brands, typeOptions, colorOptions } = useProductAttributes();
  const allSizes = useQuery(api.functions.productSizes.list, {}) ?? [];

  const locations = useQuery(api.functions.locations.list, {}) ?? [];
  const packagingTemplates =
    useQuery(api.functions.packagingTemplates.list, {}) ?? [];

  const [isOpened, setOpened] = useState(false);
  const [items, setItems] = useState<TransferItem[]>([]);
  const [mode, setMode] = useState<TransferMode>("packaging");
  const [sourceLocationId, setSourceLocationId] = useState<string | null>(null);
  const [destinationLocationId, setDestinationLocationId] = useState<
    string | null
  >(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [ageCategory, setAgeCategory] = useState<string>("");

  const sizes = useMemo(() => {
    if (!ageCategory) return allSizes;
    return allSizes.filter((s) => s.ageCategory === ageCategory);
  }, [ageCategory, allSizes]);

  const form = useForm<BulkTransferIndividualSchemaType>({
    resolver: zodResolver(bulkTransferIndividualSchema),
    defaultValues: {
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    },
  });
  const typeValue = form.watch("type");
  const codeValue = form.watch("code");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];

  const packagingForm = useForm<BulkTransferPackagingSchemaType>({
    resolver: zodResolver(bulkTransferPackagingSchema),
    defaultValues: {
      // @ts-ignore
      numberOfPackages: "1",
    },
  });
  const packagingTypeValue = packagingForm.watch("productType");

  // Filter brands by selected type
  const filteredBrandOptions = useMemo(() => {
    if (!typeValue)
      return brands.map((b) => ({ label: b.value, value: b.value }));
    const selectedType = types.find((t) => t.value === typeValue);
    if (!selectedType)
      return brands.map((b) => ({ label: b.value, value: b.value }));
    return brands
      .filter((b) => b.typeId === selectedType._id || !b.typeId)
      .map((b) => ({ label: b.value, value: b.value }));
  }, [typeValue, types, brands]);

  const filteredPackagingBrandOptions = useMemo(() => {
    if (!packagingTypeValue)
      return brands.map((b) => ({ label: b.value, value: b.value }));
    const selectedType = types.find((t) => t.value === packagingTypeValue);
    if (!selectedType)
      return brands.map((b) => ({ label: b.value, value: b.value }));
    return brands
      .filter((b) => b.typeId === selectedType._id || !b.typeId)
      .map((b) => ({ label: b.value, value: b.value }));
  }, [packagingTypeValue, types, brands]);

  // Reset brand when type changes
  useEffect(() => {
    form.setValue("brand", "");
  }, [typeValue]);
  useEffect(() => {
    packagingForm.setValue("productBrand", "");
  }, [packagingTypeValue]);

  const ensureSizeDistribution = () => {
    form.setValue(
      "sizeDistribution",
      sizes.map((s) => {
        const current = form.getValues("sizeDistribution") ?? [];
        const existing = current.find((c) => c.size === s.value);
        return { size: s.value, quantity: existing?.quantity ?? 0 };
      }),
    );
  };

  useEffect(() => {
    if (sizes.length > 0) {
      ensureSizeDistribution();
    }
  }, [sizes.length]);

  // Reset size distribution when ageCategory changes
  useEffect(() => {
    form.setValue(
      "sizeDistribution",
      sizes.map((s) => ({ size: s.value, quantity: 0 })),
    );
  }, [ageCategory]);

  function callbackOnSuccess() {
    form.reset();
    packagingForm.reset();
    setOpened(false);
    setItems([]);
    setSourceLocationId(null);
    setDestinationLocationId(null);
    setFormErrors([]);
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
      },
    );
  };

  async function onAddTransferItem(values: BulkTransferIndividualSchemaType) {
    if (!sourceLocationId) {
      toast.error("Veuillez sélectionner une source");
      return;
    }

    setFormErrors([]);
    const sourceLocId = getSourceLocationIdForQuery();

    // Code mode: single item lookup
    if (values.code && values.code.length > 0) {
      const qty = parseInt(values.transferQuantity || "0");
      if (!qty || qty <= 0) {
        setFormErrors(["La quantité doit être supérieure à 0"]);
        return;
      }

      const inventory = await convex.query(
        api.functions.inventories.findByProductAttributesAtSource,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
            ? { collarColor: values.collarColor }
            : {}),
          locationId: sourceLocId as any,
        },
      );

      if (!inventory || inventory.quantity <= 0) {
        setFormErrors(["Ce produit n'a pas d'inventaire à cette source"]);
        return;
      }

      if (items.find((item) => item.productId === inventory.productId)) {
        setFormErrors(["Ce produit est déjà dans la liste"]);
        return;
      }

      if (inventory.quantity < qty) {
        setFormErrors([
          "Quantité insuffisante, quantité disponible: " + inventory.quantity,
        ]);
        return;
      }

      setItems([
        ...items,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          collarColor: values.collarColor,
          productId: inventory.productId,
          transferQuantity: qty,
          availableQuantity: inventory.quantity,
        },
      ]);
      const currentValues = form.getValues();
      form.reset({
        type: currentValues.type,
        brand: currentValues.brand,
        code: currentValues.code,
        color: currentValues.color,
        collarColor: currentValues.collarColor,
        transferQuantity: "",
        sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
      });
      return;
    }

    // Size distribution mode
    const nonZeroSizes = values.sizeDistribution.filter((s) => s.quantity > 0);
    const errors: string[] = [];
    const newItems: TransferItem[] = [];

    const results = await Promise.allSettled(
      nonZeroSizes.map(async (entry) => {
        const inventory = await convex.query(
          api.functions.inventories.findByProductAttributesAtSource,
          {
            type: values.type,
            brand: values.brand,
            ...(values.color ? { color: values.color } : {}),
            size: entry.size,
            ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
              ? { collarColor: values.collarColor }
              : {}),
            locationId: sourceLocId as any,
          },
        );
        return { entry, inventory };
      }),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        errors.push("Erreur lors de la recherche d'un produit");
        continue;
      }
      const { entry, inventory } = result.value;
      if (!inventory || inventory.quantity <= 0) {
        errors.push(`Taille ${entry.size}: pas d'inventaire à cette source`);
        continue;
      }
      if (items.find((item) => item.productId === inventory.productId)) {
        errors.push(`Taille ${entry.size}: déjà dans la liste`);
        continue;
      }
      if (inventory.quantity < entry.quantity) {
        errors.push(
          `Taille ${entry.size}: quantité insuffisante (disponible: ${inventory.quantity})`,
        );
        continue;
      }
      newItems.push({
        type: values.type,
        brand: values.brand,
        color: values.color,
        size: entry.size,
        collarColor: values.collarColor,
        productId: inventory.productId,
        transferQuantity: entry.quantity,
        availableQuantity: inventory.quantity,
      });
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setItems([...items, ...newItems]);
    const currentValues = form.getValues();
    form.reset({
      type: currentValues.type,
      brand: currentValues.brand,
      code: currentValues.code,
      color: currentValues.color,
      collarColor: currentValues.collarColor,
      transferQuantity: "",
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    });
  }

  async function onAddPackagingTransfer(
    values: BulkTransferPackagingSchemaType,
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
          productType: values.productType,
          productBrand: values.productBrand,
          color: values.color,
          ...(values.collarColor ? { collarColor: values.collarColor } : {}),
          locationId: sourceLocId as any,
          checkInventory: true,
        },
      );

      if (result.missingProducts.length > 0) {
        toast.error(`Produits manquants: ${result.missingProducts.join(", ")}`);
        return;
      }

      if (result.insufficientStock.length > 0) {
        const details = result.insufficientStock
          .map(
            (s: any) => `${s.size}: ${s.available}/${s.required} disponible(s)`,
          )
          .join(", ");
        toast.error(`Stock insuffisant - ${details}`);
        return;
      }

      // Check for duplicates
      const duplicates = result.items.filter((item: any) =>
        items.find((existing) => existing.productId === item.productId),
      );
      if (duplicates.length > 0) {
        toast.error(
          `Certains produits sont déjà dans la liste: ${duplicates.map((d: any) => d.size).join(", ")}`,
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
      const currentValues = packagingForm.getValues();
      packagingForm.reset({
        templateId: currentValues.templateId,
        numberOfPackages: "1" as any,
        productType: currentValues.productType,
        productBrand: currentValues.productBrand,
        color: "",
        collarColor: "",
        // price: currentValues.price,
      });
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
    form.setValue("collarColor", item.collarColor);

    // Set the size distribution: only the edited size gets a quantity
    if (item.size) {
      form.setValue(
        "sizeDistribution",
        sizes.map((s) => ({
          size: s.value,
          quantity: s.value === item.size ? item.transferQuantity : 0,
        })),
      );
    }
    if (item.code) {
      form.setValue("transferQuantity", item.transferQuantity.toString());
    }

    updated.splice(index, 1);
    setItems(updated);
    setMode("individual");
    setFormErrors([]);
  };

  const templateOptions = packagingTemplates.map((t: any) => ({
    label: `${t.name} (${t.packagingType === "BALE" ? "Ballon" : "Douzaine"} - ${t.totalItems} pcs)`,
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

  const hasCode = codeValue && codeValue.length > 0;

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
          onClick={() => {
            setMode("packaging");
            setFormErrors([]);
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "packaging"
              ? "bg-white text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Emballage
        </button>
        <button
          type="button"
          onClick={() => {
            setMode("individual");
            setFormErrors([]);
          }}
          className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            mode === "individual"
              ? "bg-white text-[var(--text-primary)] shadow-sm"
              : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"
          }`}
        >
          Individuel
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
                  options={filteredBrandOptions}
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

            {!hasCode && (
              <>
                <div
                  className={`grid gap-4${typeValue?.toLowerCase()?.includes("polo") ? " grid-cols-2" : ""}`}
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
                  {typeValue?.toLowerCase()?.includes("polo") && (
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
                  <Label>Catégorie</Label>
                  <SelectUI
                    value={ageCategory || undefined}
                    onValueChange={(val) => setAgeCategory(val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Adulte / Enfant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="adult">Adulte</SelectItem>
                      <SelectItem value="child">Enfant</SelectItem>
                    </SelectContent>
                  </SelectUI>
                </div>

                <SizeDistributionGrid
                  sizes={sizes}
                  values={sizeDistribution}
                  onChange={(index, size, quantity) => {
                    form.setValue(`sizeDistribution.${index}.size`, size);
                    form.setValue(
                      `sizeDistribution.${index}.quantity`,
                      quantity,
                    );
                  }}
                />
              </>
            )}

            {hasCode && (
              <div className="mb-2 grid gap-1">
                <Input
                  control={form.control}
                  name="transferQuantity"
                  label="Quantité à transférer"
                  type="number"
                  placeholder="Entrez la quantité"
                />
              </div>
            )}

            <FormErrorAlert
              errors={formErrors}
              onDismiss={() => setFormErrors([])}
            />

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
            <SelectInput
              control={packagingForm.control}
              name="templateId"
              label="Modèle d'emballage"
              placeholder="Sélectionnez un modèle"
              options={templateOptions}
            />

            <div className="grid grid-cols-2 gap-4">
              <SelectInput
                control={packagingForm.control}
                name="productType"
                label="Type de produit"
                placeholder="Sélectionnez un type"
                options={typeOptions}
              />
              <SelectInput
                control={packagingForm.control}
                name="productBrand"
                label="Marque"
                placeholder="Sélectionnez une marque"
                options={filteredPackagingBrandOptions}
              />
            </div>

            <div
              className={`grid gap-4${packagingTypeValue?.toLowerCase()?.includes("polo") ? " grid-cols-2" : ""}`}
            >
              <SelectInput
                control={packagingForm.control}
                name="color"
                label="Couleur"
                placeholder="Sélectionnez une couleur"
                options={colorOptions}
              />
              {packagingTypeValue?.toLowerCase()?.includes("polo") && (
                <SelectInput
                  control={packagingForm.control}
                  name="collarColor"
                  label="Couleur du col"
                  placeholder="Sélectionnez une couleur"
                  options={colorOptions}
                />
              )}
            </div>

            <Input
              control={packagingForm.control}
              name="numberOfPackages"
              label="Nombre d'emballages"
              type="number"
              placeholder="1"
            />

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
              <TableHead className="text-center">A transferer</TableHead>
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
              setFormErrors([]);
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
