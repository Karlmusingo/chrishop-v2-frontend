"use client";

import { FC, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";
import SelectInput from "@/components/custom/SelectInput";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  packagingTemplateSchema,
  PackagingTemplateSchemaType,
} from "@/schemas/configuration/packagingTemplate.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useQuery } from "convex/react";

const packagingTypeOptions = [
  { label: "Ballon", value: "BALE" },
  { label: "Douzaine", value: "DOZEN" },
];

interface PackagingTemplateItem {
  _id: string;
  name: string;
  packagingType: "BALE" | "DOZEN";
  totalItems: number;
  sizeDistribution: Array<{ size: string; quantity: number }>;
  ageCategory?: string;
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
  const allSizes = useQuery(api.functions.productSizes.list, {}) ?? [];
  const [ageCategory, setAgeCategory] = useState<string>("");

  const sizes = useMemo(() => {
    if (!ageCategory) return allSizes;
    return allSizes.filter((s) => s.ageCategory === ageCategory);
  }, [ageCategory, allSizes]);

  const form = useForm<PackagingTemplateSchemaType>({
    resolver: zodResolver(packagingTemplateSchema),
  });

  const totalItems = form.watch("totalItems");
  const sizeDistribution = form.watch("sizeDistribution") ?? [];
  const currentSum = sizeDistribution.reduce(
    (acc, s) => acc + (s?.quantity || 0),
    0
  );

  useEffect(() => {
    if (item) {
      setAgeCategory(item.ageCategory ?? "");
    }
  }, [item]);

  useEffect(() => {
    if (item && sizes.length > 0) {
      form.setValue("name", item.name);
      form.setValue("packagingType", item.packagingType);
      // @ts-ignore
      form.setValue("totalItems", item.totalItems.toString());

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
        sizeDistribution: nonZeroSizes,
        ageCategory: ageCategory || undefined,
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
            placeholder="Ex: Ballon Standard 240"
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

          <div className="grid gap-1">
            <Label>Catégorie</Label>
            <SelectUI
              value={ageCategory || undefined}
              onValueChange={(val) => {
                setAgeCategory(val);
                // Reset size distribution for new category
                const newSizes = allSizes.filter((s) => s.ageCategory === val);
                form.setValue(
                  "sizeDistribution",
                  newSizes.map((s) => ({ size: s.value, quantity: 0 }))
                );
              }}
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
                    {size.value}
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
