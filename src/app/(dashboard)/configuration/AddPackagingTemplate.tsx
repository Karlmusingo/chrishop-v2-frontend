"use client";

import { FC, useState } from "react";
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

const AddPackagingTemplate: FC = () => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.packagingTemplates.create
  );
  const { typeOptions, brandOptions, colorOptions, sizeOptions } =
    useProductAttributes();
  const sizes = useQuery(api.functions.productSizes.list, {}) ?? [];
  const [isOpened, setOpened] = useState(false);

  const form = useForm<PackagingTemplateSchemaType>({
    resolver: zodResolver(packagingTemplateSchema),
    defaultValues: {
      sizeDistribution: sizes.map((s) => ({ size: s.value, quantity: 0 })),
    },
  });

  const typeValue = form.watch("productType");
  const totalItems = form.watch("totalItems");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];
  const currentSum = sizeDistribution.reduce(
    (acc, s) => acc + (s?.quantity || 0),
    0
  );

  // Ensure sizeDistribution stays in sync with available sizes
  const ensureSizeDistribution = () => {
    const current = form.getValues("sizeDistribution") ?? [];
    if (current.length !== sizes.length) {
      form.setValue(
        "sizeDistribution",
        sizes.map((s) => {
          const existing = current.find((c) => c.size === s.value);
          return { size: s.value, quantity: existing?.quantity ?? 0 };
        })
      );
    }
  };

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
  }

  const handleSubmit = (values: PackagingTemplateSchemaType) => {
    const nonZeroSizes = values.sizeDistribution.filter(
      (s) => s.quantity > 0
    );

    mutate(
      {
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
        successMessage: "Modèle d'emballage créé avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  return (
    <Modal
      title="Ajouter un modèle d'emballage"
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[600px]",
      }}
      trigger={
        <Button icon="Plus" type="button" onClick={() => { setOpened(true); ensureSizeDistribution(); }}>
          Ajouter
        </Button>
      }
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
            Ajouter
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddPackagingTemplate;
