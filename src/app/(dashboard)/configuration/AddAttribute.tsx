"use client";

import { FC, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";
import {
  attributeSchema,
  AttributeSchemaType,
} from "@/schemas/configuration/attribute.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { ReactMutation } from "convex/react";
import { FunctionReference } from "convex/server";

interface AddAttributeProps {
  categoryLabel: string;
  createMutation: FunctionReference<"mutation", "public", any, any>;
}

const AddAttribute: FC<AddAttributeProps> = ({
  categoryLabel,
  createMutation,
}) => {
  const { mutate, isPending } = useMutationWithToast(createMutation);
  const [isOpened, setOpened] = useState(false);

  const form = useForm<AttributeSchemaType>({
    resolver: zodResolver(attributeSchema),
  });

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
  }

  const handleSubmit = (values: AttributeSchemaType) => {
    mutate(
      {
        label: values.label,
        value: values.value,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: `${categoryLabel} ajouté avec succès`,
        onSuccess: callbackOnSuccess,
      }
    );
  };

  return (
    <Modal
      title={`Ajouter ${categoryLabel}`}
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full",
      }}
      trigger={
        <Button
          icon="Plus"
          type="button"
          onClick={() => setOpened(true)}
        >
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
            name="label"
            label="Libellé"
            control={form.control}
            placeholder="Ex: Polo manches longues"
          />
          <Input
            name="value"
            label="Valeur"
            control={form.control}
            placeholder="Ex: longsleeves polo"
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

export default AddAttribute;
