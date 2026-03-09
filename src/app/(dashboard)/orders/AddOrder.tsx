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
import { IUnknown } from "@/interface/Iunknown";

import {
  addOrderSchema,
  AddOrderSchemaType,
} from "@/schemas/orders/orders.schema";
import {
  addPackagingOrderSchema,
  AddPackagingOrderSchemaType,
} from "@/schemas/orders/addPackagingOrder.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";
import SizeDistributionGrid from "@/components/custom/SizeDistributionGrid";
import FormErrorAlert from "@/components/custom/FormErrorAlert";

interface AddOrderProps {
  callback?: () => void;
  orderData?: IUnknown;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  moveToNext?: (data?: IUnknown) => void;
}

type OrderItemType = {
  type: string;
  brand: string;
  code?: string;
  color?: string;
  collarColor?: string;
  size?: string;
  quantity: number;
  productId: string;
  price: number;
  total: number;
};

type OrderMode = "individual" | "packaging";

const AddOrder: FC<AddOrderProps> = ({
  callback,
  orderData,
  isOpen,
  setIsOpen,
  moveToNext,
}) => {
  const convex = useConvex();
  const { mutate: createMutate, isPending } = useMutationWithToast(
    api.functions.orders.create,
  );
  const { mutate: updateMutate, isPending: isPendingUpdate } =
    useMutationWithToast(api.functions.orders.update);
  const { data: profile } = usePermission();
  const isAdmin = profile?.role === ROLES.ADMIN;
  const locations =
    useQuery(api.functions.locations.list, isAdmin ? {} : "skip") ?? [];
  const { types, brands, typeOptions, colorOptions } = useProductAttributes();
  const allSizes = useQuery(api.functions.productSizes.list, {}) ?? [];

  const [orders, setOrders] = useState<OrderItemType[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );
  const [mode, setMode] = useState<OrderMode>("individual");
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [ageCategory, setAgeCategory] = useState<string>("");

  const sizes = useMemo(() => {
    if (!ageCategory) return allSizes;
    return allSizes.filter((s) => s.ageCategory === ageCategory);
  }, [ageCategory, allSizes]);

  const packagingTemplates =
    useQuery(api.functions.packagingTemplates.list, {}) ?? [];

  const form = useForm<AddOrderSchemaType>({
    resolver: zodResolver(addOrderSchema),
    defaultValues: {
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    },
  });
  const typeValue = form.watch("type");
  const codeValue = form.watch("code");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];

  const packagingForm = useForm<AddPackagingOrderSchemaType>({
    resolver: zodResolver(addPackagingOrderSchema),
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

  const isEditing = !!orderData?._id;

  // Keep sizeDistribution in sync with available sizes
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

  useEffect(() => {
    if (orderData && orderData.orderItems) {
      setOrders(
        orderData.orderItems.map((item: any) => ({
          type: item.product.type,
          brand: item.product.brand,
          code: item.product.code,
          color: item.product.color,
          size: item.product.size,
          quantity: item.quantity,
          collarColor: item.product.collarColor,
          productId: item.productId,
          price: item.unitPrice,
          total: item.totalPrice,
        })),
      );
      if (orderData.locationId) {
        setSelectedLocationId(orderData.locationId);
      }
    }
  }, [orderData]);

  function callbackOnSuccess(data?: IUnknown) {
    form.reset();
    packagingForm.reset();
    moveToNext?.(data);
    callback?.();
  }

  const getLocationId = () => {
    return isAdmin ? selectedLocationId : profile?.locationId;
  };

  const handleSubmit = () => {
    const locationId = getLocationId();
    if (!locationId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    if (orders.length === 0) {
      toast.error("Veuillez ajouter au moins un article");
      return;
    }

    if (orderData?._id) {
      return updateMutate(
        {
          id: orderData._id as any,
          items: orders.map((item) => ({
            productId: item.productId as any,
            quantity: item.quantity,
          })),
          userId: profile._id as any,
          locationId: locationId as any,
        },
        {
          successMessage: "Commande mise à jour avec succès",
          onSuccess: callbackOnSuccess,
        },
      );
    }

    createMutate(
      {
        items: orders.map((item) => ({
          productId: item.productId as any,
          quantity: item.quantity,
        })),
        userId: profile._id as any,
        locationId: locationId as any,
      },
      {
        successMessage: "Commande créée avec succès",
        onSuccess: callbackOnSuccess,
      },
    );
  };

  async function onAddOrder(values: AddOrderSchemaType) {
    const locationId = getLocationId();
    if (!locationId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    setFormErrors([]);

    // Code mode: single item lookup
    if (values.code && values.code.length > 0) {
      const qty = parseInt(values.quantity || "0");
      if (!qty || qty <= 0) {
        setFormErrors(["La quantité doit être supérieure à 0"]);
        return;
      }

      const inventory = await convex.query(
        api.functions.inventories.findByProductAttributes,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          ...(values.color ? { color: values.color } : {}),
          ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
            ? { collarColor: values.collarColor }
            : {}),
          locationId: locationId as any,
        },
      );

      if (!inventory || inventory.quantity <= 0) {
        setFormErrors(["Ce produit n'a pas d'inventaire"]);
        return;
      }

      if (orders.find((item) => item.productId === inventory.productId)) {
        setFormErrors(["Ce produit est déjà dans la liste"]);
        return;
      }

      if (inventory.quantity < qty) {
        setFormErrors([
          "Quantité insuffisante, quantité disponible: " + inventory.quantity,
        ]);
        return;
      }

      setOrders([
        ...orders,
        {
          type: values.type,
          brand: values.brand,
          code: values.code,
          color: values.color,
          collarColor: values.collarColor,
          quantity: qty,
          productId: inventory.productId,
          price: inventory.price,
          total: (inventory.price ?? 1) * qty,
        },
      ]);
      const currentValues = form.getValues();
      form.reset({
        type: currentValues.type,
        brand: currentValues.brand,
        code: currentValues.code,
        color: currentValues.color,
        collarColor: currentValues.collarColor,
        quantity: "",
        sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
      });
      return;
    }

    // Size distribution mode
    const nonZeroSizes = values.sizeDistribution.filter((s) => s.quantity > 0);
    const errors: string[] = [];
    const newItems: OrderItemType[] = [];

    const results = await Promise.allSettled(
      nonZeroSizes.map(async (entry) => {
        const inventory = await convex.query(
          api.functions.inventories.findByProductAttributes,
          {
            type: values.type,
            brand: values.brand,
            ...(values.color ? { color: values.color } : {}),
            size: entry.size,
            ...(typeValue?.toLowerCase()?.includes("polo") && values.collarColor
              ? { collarColor: values.collarColor }
              : {}),
            locationId: locationId as any,
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
        errors.push(`Taille ${entry.size}: pas d'inventaire`);
        continue;
      }
      if (orders.find((item) => item.productId === inventory.productId)) {
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
        quantity: entry.quantity,
        productId: inventory.productId,
        price: inventory.price,
        total: (inventory.price ?? 1) * entry.quantity,
      });
    }

    if (errors.length > 0) {
      setFormErrors(errors);
      return;
    }

    setOrders([...orders, ...newItems]);
    const currentValues = form.getValues();
    form.reset({
      type: currentValues.type,
      brand: currentValues.brand,
      code: currentValues.code,
      color: currentValues.color,
      collarColor: currentValues.collarColor,
      quantity: "",
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    });
  }

  async function onAddPackagingOrder(values: AddPackagingOrderSchemaType) {
    const locationId = getLocationId();
    if (!locationId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    try {
      const result = await convex.query(
        api.functions.packagingTemplates.expandToItems,
        {
          templateId: values.templateId as any,
          numberOfPackages: values.numberOfPackages,
          productType: values.productType,
          productBrand: values.productBrand,
          color: values.color,
          ...(values.collarColor ? { collarColor: values.collarColor } : {}),
          locationId: locationId as any,
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

      // Check for duplicates with existing order items
      const duplicates = result.items.filter((item: any) =>
        orders.find((o) => o.productId === item.productId),
      );
      if (duplicates.length > 0) {
        toast.error(
          `Certains produits sont déjà dans la liste: ${duplicates.map((d: any) => d.size).join(", ")}`,
        );
        return;
      }

      const newItems: OrderItemType[] = result.items.map((item: any) => ({
        type: item.type,
        brand: item.brand,
        color: item.color,
        size: item.size,
        collarColor: item.collarColor,
        code: undefined,
        quantity: item.quantity,
        productId: item.productId,
        price: item.inventoryPrice ?? 0,
        total: (item.inventoryPrice ?? 0) * item.quantity,
      }));

      setOrders([...orders, ...newItems]);
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

  const handleRemoveFromOrders = (index: number) => {
    const updatedInventory = [...orders];
    updatedInventory.splice(index, 1);
    setOrders(updatedInventory);
  };

  const handleEditOrder = (index: number) => {
    const updatedOrder = [...orders];
    const orderItem = updatedOrder[index];

    form.setValue("type", orderItem.type);
    form.setValue("brand", orderItem.brand);
    form.setValue("code", orderItem.code);
    form.setValue("color", orderItem.color);
    form.setValue("collarColor", orderItem.collarColor);

    // Set the size distribution: only the edited size gets a quantity
    if (orderItem.size) {
      form.setValue(
        "sizeDistribution",
        sizes.map((s) => ({
          size: s.value,
          quantity: s.value === orderItem.size ? orderItem.quantity : 0,
        })),
      );
    }
    if (orderItem.code) {
      form.setValue("quantity", orderItem.quantity.toString());
    }

    updatedOrder.splice(index, 1);
    setOrders(updatedOrder);
    setMode("individual");
    setFormErrors([]);
  };

  const totalSize = orders.reduce((acc, curr) => acc + curr.total, 0);
  const hasCode = codeValue && codeValue.length > 0;

  const templateOptions = packagingTemplates.map((t: any) => ({
    label: `${t.name} (${t.packagingType === "BALE" ? "Ballon" : "Douzaine"} - ${t.totalItems} pcs)`,
    value: t._id,
  }));

  return (
    <Modal
      title="Ajouter une vente"
      description=""
      onClose={() => setIsOpen(false)}
      isOpened={isOpen}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
      }}
      trigger={
        <Button
          icon="Plus"
          type="button"
          disabled={!profile?.location && profile?.role !== "ADMIN"}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Ajouter une vente
        </Button>
      }
    >
      {isAdmin && (
        <div className="grid gap-1 mb-4">
          <Label>Boutique</Label>
          <SelectUI
            value={selectedLocationId ?? undefined}
            disabled={isEditing}
            onValueChange={(val) => {
              setSelectedLocationId(val);
              setOrders([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une boutique" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc: any) => (
                <SelectItem key={loc._id} value={loc._id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectUI>
        </div>
      )}

      {/* Mode toggle */}
      <div className="mb-4 flex gap-1 rounded-lg border bg-[#F8F8F8] p-1">
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
      </div>

      {mode === "individual" ? (
        <Form {...form}>
          <form
            className="grid gap-4 py-4 rounded-lg border p-6"
            onSubmit={form.handleSubmit(onAddOrder)}
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

            {!hasCode && (
              <>
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
                  name="quantity"
                  label="Quantité"
                  type="number"
                  placeholder="Entrez la quantité"
                />
              </div>
            )}

            <FormErrorAlert
              errors={formErrors}
              onDismiss={() => setFormErrors([])}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isPendingUpdate}
            >
              Ajouter
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...packagingForm}>
          <form
            className="grid gap-4 py-4 rounded-lg border p-6"
            onSubmit={packagingForm.handleSubmit(onAddPackagingOrder)}
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

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || isPendingUpdate}
            >
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
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((item, index) => (
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
                <TableCell className="text-center">{item.total}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => handleEditOrder(index)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => handleRemoveFromOrders(index)}
                  >
                    <Trash className="text-red-500" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableCell className="text-center font-bold">Total</TableCell>
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center font-bold">
                {totalSize}
              </TableCell>
              <TableCell className="text-right" />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <div className="flex gap-2">
          <Button
            className="w-full"
            loading={isPending || isPendingUpdate}
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              packagingForm.reset();
              setOrders([]);
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

export default AddOrder;
