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
  sizeAttributeSchema,
  SizeAttributeSchemaType,
} from "@/schemas/configuration/sizeAttribute.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

const ageCategoryOptions = [
  { label: "Adulte", value: "adult" },
  { label: "Enfant", value: "child" },
];

interface SizeItem {
  _id: string;
  value: string;
  sortOrder?: number;
  ageCategory?: string;
}

interface EditSizeProps {
  item: SizeItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditSize: FC<EditSizeProps> = ({ item, isOpen, onClose }) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.productSizes.update
  );

  const form = useForm<SizeAttributeSchemaType>({
    resolver: zodResolver(sizeAttributeSchema),
  });

  useEffect(() => {
    if (item) {
      form.setValue("value", item.value);
      form.setValue("ageCategory", item.ageCategory ?? "");
      // @ts-ignore
      form.setValue("sortOrder", item.sortOrder?.toString() ?? "");
    }
  }, [item]);

  const handleSubmit = (values: SizeAttributeSchemaType) => {
    if (!item) return;

    mutate(
      {
        id: item._id as any,
        value: values.value,
        ageCategory: values.ageCategory,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: "Taille mise à jour avec succès",
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title="Modifier Taille"
      description=""
      onClose={onClose}
      isOpened={isOpen}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full",
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-4"
        >
          <SelectInput
            name="ageCategory"
            label="Catégorie"
            control={form.control}
            placeholder="Sélectionnez une catégorie"
            options={ageCategoryOptions}
          />
          <Input
            name="value"
            label="Nom"
            control={form.control}
            placeholder="Ex: S, M, L, 1, 2, 3"
          />
          <Input
            name="sortOrder"
            label="Ordre (optionnel)"
            control={form.control}
            type="number"
            placeholder="Ex: 0"
          />
          <Button loading={isPending} type="submit" className="w-full">
            Enregistrer
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default EditSize;
