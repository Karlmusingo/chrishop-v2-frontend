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
  brandAttributeSchema,
  BrandAttributeSchemaType,
} from "@/schemas/configuration/brandAttribute.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface BrandItem {
  _id: string;
  value: string;
  sortOrder?: number;
  typeId?: string;
}

interface EditBrandProps {
  typeOptions: { label: string; value: string }[];
  item: BrandItem | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditBrand: FC<EditBrandProps> = ({ typeOptions, item, isOpen, onClose }) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.productBrands.update
  );

  const form = useForm<BrandAttributeSchemaType>({
    resolver: zodResolver(brandAttributeSchema),
  });

  useEffect(() => {
    if (item) {
      form.setValue("value", item.value);
      form.setValue("typeId", item.typeId ?? "");
      // @ts-ignore
      form.setValue("sortOrder", item.sortOrder?.toString() ?? "");
    }
  }, [item]);

  const handleSubmit = (values: BrandAttributeSchemaType) => {
    if (!item) return;

    mutate(
      {
        id: item._id as any,
        value: values.value,
        typeId: values.typeId as any,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: "Marque mise à jour avec succès",
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title="Modifier Marque"
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
            name="typeId"
            label="Type"
            control={form.control}
            placeholder="Sélectionnez un type"
            options={typeOptions}
          />
          <Input
            name="value"
            label="Nom"
            control={form.control}
            placeholder="Ex: Nike"
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

export default EditBrand;
