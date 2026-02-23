"use client";

import { FC, useEffect } from "react";
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
import { FunctionReference } from "convex/server";

interface EditAttributeProps {
  categoryLabel: string;
  updateMutation: FunctionReference<"mutation", "public", any, any>;
  item: { _id: string; label: string; value: string; sortOrder?: number } | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditAttribute: FC<EditAttributeProps> = ({
  categoryLabel,
  updateMutation,
  item,
  isOpen,
  onClose,
}) => {
  const { mutate, isPending } = useMutationWithToast(updateMutation);

  const form = useForm<AttributeSchemaType>({
    resolver: zodResolver(attributeSchema),
  });

  useEffect(() => {
    if (item) {
      form.setValue("label", item.label);
      form.setValue("value", item.value);
      // @ts-ignore
      form.setValue("sortOrder", item.sortOrder?.toString() ?? "");
    }
  }, [item]);

  const handleSubmit = (values: AttributeSchemaType) => {
    if (!item) return;

    mutate(
      {
        id: item._id as any,
        label: values.label,
        value: values.value,
        ...(values.sortOrder !== undefined
          ? { sortOrder: values.sortOrder }
          : {}),
      },
      {
        successMessage: `${categoryLabel} mis à jour avec succès`,
        onSuccess: () => {
          form.reset();
          onClose();
        },
      }
    );
  };

  return (
    <Modal
      title={`Modifier ${categoryLabel}`}
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
            Enregistrer
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default EditAttribute;
