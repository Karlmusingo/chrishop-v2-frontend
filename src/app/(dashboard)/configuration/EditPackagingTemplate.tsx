"use client";

import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";
import SelectInput from "@/components/custom/SelectInput";
import {
  packagingTemplateSchema,
  PackagingTemplateSchemaType,
} from "@/schemas/configuration/packagingTemplate.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";
import { useQuery } from "convex/react";

const packagingTypeOptions = [
  { label: "Balle", value: "BALE" },
  { label: "Douzaine", value: "DOZEN" },
];

interface PackagingTemplateItem {
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

interface EditPackagingTemplateProps {
  item: PackagingTemplateItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditPackagingTemplate: FC<EditPackagingTemplateProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.packagingTemplates.update
  );
  const { typeOptions, brandOptions, colorOptions } = useProductAttributes();
  const sizes = useQuery(api.functions.productSizes.list, {}) ?? [];

  const form = useForm<PackagingTemplateSchemaType>({
    resolver: zodResolver(packagingTemplateSchema),
  });

  const typeValue = form.watch("productType");
  const totalItems = form.watch("totalItems");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];
  const currentSum = sizeDistribution.reduce(
    (acc, s) => acc + (s?.quantity || 0),
    0
  );

  useEffect(() => {
    if (item && sizes.length > 0) {
      form.setValue("name", item.name);
      form.setValue("packagingType", item.packagingType);
      // @ts-ignore
      form.setValue("totalItems", item.totalItems.toString());
      form.setValue("productType", item.productType);
      form.setValue("productBrand", item.productBrand);
      form.setValue("color", item.color);
      form.setValue("collarColor", item.collarColor ?? "");

      // Map existing distribution to all sizes
      const dist = sizes.map((s) => {
        const existing = item.sizeDistribution.find(
          (d) => d.size === s.value
        );
        return { size: s.value, quantity: existing?.quantity ?? 0 };
      });
      form.setValue("sizeDistribution", dist);
    }
  }, [item, sizes.length]);

  const handleSubmit = (values: PackagingTemplateSchemaType) => {
    if (!item) return;

    const nonZeroSizes = values.sizeDistribution.filter(
      (s) => s.quantity > 0
    );

    mutate(
      {
        id: item._id as any,
        name: values.name,
        packagingType: values.packagingType,
        totalItems: values.totalItems,
        productType: values.productType,
        productBrand: values.productBrand,
        color: values.color,
        ...(values.collarColor ? { collarColor: values.collarColor } : {}),
        sizeDistribution: nonZeroSizes,
      },
      {
        successMessage: "Modèle d'emballage mis à jour avec succès",
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title="Modifier le modèle d'emballage"
      description=""
      onClose={onClose}
      isOpened={isOpen}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[600px]",
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-4"
        >
          <Input
            name="name"
            label="Nom"
            control={form.control}
            placeholder="Ex: Balle Rouge d'Inde"
          />

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              control={form.control}
              name="packagingType"
              label="Type d'emballage"
              placeholder="Sélectionnez"
              options={packagingTypeOptions}
            />
            <Input
              name="totalItems"
              label="Total d'articles"
              control={form.control}
              type="number"
              placeholder="Ex: 240"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              control={form.control}
              name="productType"
              label="Type de produit"
              placeholder="Sélectionnez un type"
              options={typeOptions}
            />
            <SelectInput
              control={form.control}
              name="productBrand"
              label="Marque"
              placeholder="Sélectionnez une marque"
              options={brandOptions}
            />
          </div>

          <div
            className={`grid gap-4${typeValue?.includes("polo") ? " grid-cols-2" : ""}`}
          >
            <SelectInput
              control={form.control}
              name="color"
              label="Couleur"
              placeholder="Sélectionnez une couleur"
              options={colorOptions}
            />
            {typeValue?.includes("polo") && (
              <SelectInput
                control={form.control}
                name="collarColor"
                label="Couleur du col"
                placeholder="Sélectionnez une couleur"
                options={colorOptions}
              />
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Distribution par taille
              </label>
              <span
                className={`text-sm font-semibold ${
                  totalItems && currentSum !== totalItems
                    ? "text-red-500"
                    : "text-green-600"
                }`}
              >
                {currentSum} / {totalItems || 0}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-3 sm:grid-cols-3">
              {sizes.map((size, index) => (
                <div key={size.value} className="flex items-center gap-2">
                  <label className="w-12 text-sm font-medium">
                    {size.label}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="h-9 w-full rounded-md border px-2 text-sm"
                    value={sizeDistribution[index]?.quantity ?? 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      form.setValue(
                        `sizeDistribution.${index}.size`,
                        size.value
                      );
                      form.setValue(
                        `sizeDistribution.${index}.quantity`,
                        val
                      );
                    }}
                  />
                </div>
              ))}
            </div>
            {form.formState.errors.sizeDistribution && (
              <p className="text-sm text-red-500">
                {form.formState.errors.sizeDistribution.message ||
                  (form.formState.errors.sizeDistribution as any).root?.message}
              </p>
            )}
          </div>

          <Button loading={isPending} type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default EditPackagingTemplate;
