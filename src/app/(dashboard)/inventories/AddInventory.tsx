"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useEffect, useState } from "react";

import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useConvex, useMutation, useQuery } from "convex/react";

import { DialogFooter } from "@/components/ui/dialog";
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
import { IUnknown } from "@/interface/Iunknown";
import {
  addInventoriesSchema,
  AddInventoriesSchemaType,
} from "@/schemas/inventories/inventories.schema";
import {
  addPackagingInventorySchema,
  AddPackagingInventorySchemaType,
} from "@/schemas/inventories/addPackagingInventory.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";
import SizeDistributionGrid from "@/components/custom/SizeDistributionGrid";
import FormErrorAlert from "@/components/custom/FormErrorAlert";

interface AddInventoryProps {
  callback?: () => void;
}

type InventoryItemType = {
  type: string;
  brand: string;
  code?: string;
  color?: string;
  collarColor?: string;
  size?: string;
  quantity: number;
  price: number;
  productId: string;
};

type InventoryMode = "individual" | "packaging";

const AddInventory: FC<AddInventoryProps> = ({ callback }) => {
  const convex = useConvex();
  const { mutate, isPending } = useMutationWithToast(
    api.functions.inventories.create,
  );
  const ensureProducts = useMutation(
    api.functions.packagingTemplates.ensureProductsExist,
  );
  const { userRole } = usePermission();
  const { typeOptions, brandOptions, colorOptions } =
    useProductAttributes();
  const sizes = useQuery(api.functions.productSizes.list, {}) ?? [];

  const [isOpened, setOpened] = useState(false);
  const [inventory, setInventory] = useState<InventoryItemType[]>([]);
  const [mode, setMode] = useState<InventoryMode>("packaging");
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const packagingTemplates =
    useQuery(api.functions.packagingTemplates.list, {}) ?? [];

  const form = useForm<AddInventoriesSchemaType>({
    resolver: zodResolver(addInventoriesSchema),
    defaultValues: {
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    },
  });
  const typeValue = form.watch("type");
  const codeValue = form.watch("code");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];

  const packagingForm = useForm<AddPackagingInventorySchemaType>({
    resolver: zodResolver(addPackagingInventorySchema),
    defaultValues: {
      // @ts-ignore
      numberOfPackages: "1",
    },
  });
  const packagingTypeValue = packagingForm.watch("productType");

  const ensureSizeDistribution = () => {
    const current = form.getValues("sizeDistribution") ?? [];
    if (current.length !== sizes.length) {
      form.setValue(
        "sizeDistribution",
        sizes.map((s) => {
          const existing = current.find((c) => c.size === s.value);
          return { size: s.value, quantity: existing?.quantity ?? 0 };
        }),
      );
    }
  };

  useEffect(() => {
    if (sizes.length > 0) {
      ensureSizeDistribution();
    }
  }, [sizes.length]);

  function callbackOnSuccess() {
    form.reset();
    packagingForm.reset();
    setOpened(false);
    setInventory([]);
    setFormErrors([]);
    callback?.();
  }

  const handleSubmit = () => {
    mutate(
      {
        items: inventory.map((inv) => ({
          productId: inv.productId as any,
          quantity: inv.quantity,
          price: inv.price,
        })),
      },
      {
        successMessage: "Stock ajouté avec succès",
        onSuccess: callbackOnSuccess,
      },
    );
  };

  async function onAddInventory(values: AddInventoriesSchemaType) {
    setFormErrors([]);

    // Code mode: single item lookup
    if (values.code && values.code.length > 0) {
      const qty = parseInt(values.quantity || "0");
      if (!qty || qty <= 0) {
        setFormErrors(["La quantité doit être supérieure à 0"]);
        return;
      }

      const product = await convex.query(
        api.functions.products.findByAttributes,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
            ? { collarColor: values.collarColor }
            : {}),
        },
      );

      if (!product) {
        setFormErrors(["Produit non trouvé"]);
        return;
      }

      if (inventory.find((item) => item.productId === product._id)) {
        setFormErrors(["Ce produit est déjà dans l'inventaire"]);
        return;
      }

      setInventory([
        ...inventory,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          collarColor: values.collarColor,
          quantity: qty,
          price: values.price,
          productId: product._id,
        },
      ]);
      form.reset();
      ensureSizeDistribution();
      return;
    }

    // Size distribution mode
    const nonZeroSizes = values.sizeDistribution.filter((s) => s.quantity > 0);
    const errors: string[] = [];
    const newItems: InventoryItemType[] = [];

    const results = await Promise.allSettled(
      nonZeroSizes.map(async (entry) => {
        const product = await convex.query(
          api.functions.products.findByAttributes,
          {
            type: values.type,
            brand: values.brand,
            ...(values.color ? { color: values.color } : {}),
            size: entry.size,
            ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
              ? { collarColor: values.collarColor }
              : {}),
          },
        );
        return { entry, product };
      }),
    );

    for (const result of results) {
      if (result.status === "rejected") {
        errors.push("Erreur lors de la recherche d'un produit");
        continue;
      }
      const { entry, product } = result.value;
      if (!product) {
        errors.push(`Taille ${entry.size}: produit non trouvé`);
        continue;
      }
      if (inventory.find((item) => item.productId === product._id)) {
        errors.push(`Taille ${entry.size}: déjà dans l'inventaire`);
        continue;
      }
      newItems.push({
        type: values.type,
        brand: values.brand,
        color: values.color,
        size: entry.size,
        collarColor: values.collarColor,
        quantity: entry.quantity,
        price: values.price,
        productId: product._id,
      });
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setInventory([...inventory, ...newItems]);
    form.reset();
    ensureSizeDistribution();
  }

  async function onAddPackagingInventory(
    values: AddPackagingInventorySchemaType,
  ) {
    try {
      // Get template to know the sizes for product creation
      const template = await convex.query(
        api.functions.packagingTemplates.get,
        { id: values.templateId as any },
      );
      if (!template) {
        toast.error("Modèle d'emballage non trouvé");
        return;
      }

      // Ensure products exist before expanding
      await ensureProducts({
        productType: values.productType,
        productBrand: values.productBrand,
        color: values.color,
        ...(values.collarColor ? { collarColor: values.collarColor } : {}),
        sizes: template.sizeDistribution.map((s) => s.size),
      });

      const result = await convex.query(
        api.functions.packagingTemplates.expandToItems,
        {
          templateId: values.templateId as any,
          numberOfPackages: values.numberOfPackages,
          productType: values.productType,
          productBrand: values.productBrand,
          color: values.color,
          ...(values.collarColor ? { collarColor: values.collarColor } : {}),
        },
      );

      if (result.missingProducts.length > 0) {
        toast.error(`Produits manquants: ${result.missingProducts.join(", ")}`);
        return;
      }

      // Check for duplicates with existing inventory items
      const duplicates = result.items.filter((item: any) =>
        inventory.find((inv) => inv.productId === item.productId),
      );
      if (duplicates.length > 0) {
        toast.error(
          `Certains produits sont déjà dans la liste: ${duplicates.map((d: any) => d.size).join(", ")}`,
        );
        return;
      }

      const newItems: InventoryItemType[] = result.items.map(
        (item: any) => ({
          type: item.type,
          brand: item.brand,
          color: item.color,
          size: item.size,
          collarColor: item.collarColor,
          code: undefined,
          quantity: item.quantity,
          price: values.price,
          productId: item.productId,
        }),
      );

      setInventory([...inventory, ...newItems]);
      packagingForm.reset();
      // @ts-ignore
      packagingForm.setValue("numberOfPackages", "1");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'expansion du modèle");
    }
  }

  const handleRemoveFromInventory = (index: number) => {
    const updatedInventory = [...inventory];
    updatedInventory.splice(index, 1);
    setInventory(updatedInventory);
  };

  const handleEditFromInventory = (index: number) => {
    const updatedInventory = [...inventory];
    const inventoryItem = updatedInventory[index];

    form.setValue("type", inventoryItem.type);
    form.setValue("brand", inventoryItem.brand);
    form.setValue("code", inventoryItem.code);
    form.setValue("color", inventoryItem.color);
    form.setValue("collarColor", inventoryItem.collarColor);
    // @ts-ignore
    form.setValue("price", inventoryItem.price.toString());

    // Set the size distribution: only the edited size gets a quantity
    if (inventoryItem.size) {
      form.setValue(
        "sizeDistribution",
        sizes.map((s) => ({
          size: s.value,
          quantity: s.value === inventoryItem.size ? inventoryItem.quantity : 0,
        })),
      );
    }
    if (inventoryItem.code) {
      form.setValue("quantity", inventoryItem.quantity.toString());
    }

    updatedInventory.splice(index, 1);
    setInventory(updatedInventory);
    setMode("individual");
    setFormErrors([]);
  };

  const templateOptions = packagingTemplates.map((t: any) => ({
    label: `${t.name} (${t.packagingType === "BALE" ? "Ballon" : "Douzaine"} - ${t.totalItems} pcs)`,
    value: t._id,
  }));

  const hasCode = codeValue && codeValue.length > 0;

  return (
    <Modal
      title="Ajouter du stock"
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
            icon="Plus"
            type="button"
            disabled={userRole !== ROLES.ADMIN}
            onClick={() => {
              setOpened(true);
            }}
          >
            Ajouter du stock
          </Button>
        )
      }
    >
      {/* Mode toggle */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-[#F8F8F8] p-1">
        <button
          type="button"
          onClick={() => { setMode("packaging"); setFormErrors([]); }}
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
          onClick={() => { setMode("individual"); setFormErrors([]); }}
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
            onSubmit={form.handleSubmit(onAddInventory)}
          >
            <div className=" grid grid-cols-2 gap-4">
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

                <SizeDistributionGrid
                  sizes={sizes}
                  values={sizeDistribution}
                  onChange={(index, size, quantity) => {
                    form.setValue(`sizeDistribution.${index}.size`, size);
                    form.setValue(`sizeDistribution.${index}.quantity`, quantity);
                  }}
                />
              </>
            )}

            {hasCode && (
              <div className="mb-2 grid gap-1">
                <Input
                  control={form.control}
                  name="quantity"
                  label="Quantité"
                  type="number"
                  placeholder="Entrez la quantité"
                />
              </div>
            )}

            <div className="mb-2 grid gap-1">
              <Input
                control={form.control}
                name="price"
                label="Prix"
                type="number"
                placeholder="Entrez le prix"
              />
            </div>

            <FormErrorAlert errors={formErrors} onDismiss={() => setFormErrors([])} />

            <Button type="submit" className="w-full" loading={isPending}>
              Ajouter
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...packagingForm}>
          <form
            className="grid gap-4 py-4 rounded-lg border p-6"
            onSubmit={packagingForm.handleSubmit(onAddPackagingInventory)}
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
                options={brandOptions}
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

            <div className="grid grid-cols-2 gap-4">
              <Input
                control={packagingForm.control}
                name="numberOfPackages"
                label="Nombre d'emballages"
                type="number"
                placeholder="1"
              />
              <Input
                control={packagingForm.control}
                name="price"
                label="Prix unitaire"
                type="number"
                placeholder="Entrez le prix"
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
              <TableHead className="text-center">Code</TableHead>
              <TableHead className="text-center">Couleur</TableHead>
              <TableHead className="text-center">Taille</TableHead>
              <TableHead className="text-center">Quantité</TableHead>
              <TableHead className="text-center">Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item, index) => (
              <TableRow key={index} onClick={() => null}>
                <TableCell className="text-center">{item.type}</TableCell>
                <TableCell className="text-center">{item.brand}</TableCell>
                <TableCell className="text-center">
                  {item.code || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {item.color || "-"}
                </TableCell>
                <TableCell className="text-center">
                  {item.size || "-"}
                </TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center">{item.price}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => handleEditFromInventory(index)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => handleRemoveFromInventory(index)}
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
            disabled={isPending}
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              packagingForm.reset();
              setInventory([]);
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

export default AddInventory;
