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
  sizeAttributeSchema,
  SizeAttributeSchemaType,
} from "@/schemas/configuration/sizeAttribute.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

const ageCategoryOptions = [
  { label: "Adulte", value: "adult" },
  { label: "Enfant", value: "child" },
];

const AddSize: FC = () => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.productSizes.create
  );
  const [isOpened, setOpened] = useState(false);

  const form = useForm<SizeAttributeSchemaType>({
    resolver: zodResolver(sizeAttributeSchema),
  });

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
  }

  const handleSubmit = (values: SizeAttributeSchemaType) => {
    mutate(
      {
        value: values.value,
        ageCategory: values.ageCategory,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: "Taille ajoutée avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  return (
    <Modal
      title="Ajouter Taille"
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full",
      }}
      trigger={
        <Button icon="Plus" type="button" onClick={() => setOpened(true)}>
          Ajouter
        </Button>
      }
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
            Ajouter
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddSize;
