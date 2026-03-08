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
  brandAttributeSchema,
  BrandAttributeSchemaType,
} from "@/schemas/configuration/brandAttribute.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface AddBrandProps {
  typeOptions: { label: string; value: string }[];
}

const AddBrand: FC<AddBrandProps> = ({ typeOptions }) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.productBrands.create
  );
  const [isOpened, setOpened] = useState(false);

  const form = useForm<BrandAttributeSchemaType>({
    resolver: zodResolver(brandAttributeSchema),
  });

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
  }

  const handleSubmit = (values: BrandAttributeSchemaType) => {
    mutate(
      {
        value: values.value,
        typeId: values.typeId as any,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: "Marque ajoutée avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  return (
    <Modal
      title="Ajouter Marque"
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
            Ajouter
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddBrand;
