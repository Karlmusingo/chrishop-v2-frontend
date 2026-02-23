"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useState } from "react";
import {
  addProductSchema,
  AddProductSchemaType,
} from "@/schemas/products/products.schema";
import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";

import MultiSelect from "@/components/custom/MultiSelectInput";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";

interface AddProductProps {
  callback?: () => void;
}

const AddProduct: FC<AddProductProps> = ({ callback }) => {
  const { mutate, isPending, error, isError } = useMutationWithToast(
    api.functions.products.create
  );
  const { userRole } = usePermission();
  const { typeOptions, brandOptions, colorOptions, sizeOptions } =
    useProductAttributes();

  const [isOpened, setOpened] = useState(false);

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
  });
  const typeValue = form.watch("type");

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
    callback?.();
  }

  const handleSubmit = (values: AddProductSchemaType) => {
    mutate(
      { ...values },
      {
        successMessage: "Produit créé avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  return (
    <Modal
      title="Ajouter un produit"
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full ",
      }}
      trigger={
        userRole === ROLES.ADMIN && (
          <Button
            icon="Plus"
            type="button"
            disabled={userRole !== ROLES.ADMIN}
            onClick={() => {
              setOpened(true);
            }}
          >
            Ajouter un produit
          </Button>
        )
      }
    >
      <Form {...form}>
        <form
          className="grid gap-4 py-4"
          onSubmit={form.handleSubmit(handleSubmit)}
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
                options={brandOptions}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <MultiSelect
              control={form.control}
              name="color"
              label="Couleur"
              placeholder="Sélectionnez les couleurs"
              options={colorOptions}
            />
          </div>
          <div className="grid gap-1">
            <MultiSelect
              control={form.control}
              name="size"
              label="Taille"
              placeholder="Sélectionnez les tailles"
              options={sizeOptions}
            />
          </div>

          {typeValue?.includes("polo") && (
            <div className="grid gap-1">
              <MultiSelect
                control={form.control}
                name="collarColor"
                label="Couleur de la colle"
                placeholder="Sélectionnez les couleurs"
                options={colorOptions}
              />
            </div>
          )}

          <div className="grid gap-1">
            <Input
              control={form.control}
              name="description"
              label="Description"
              placeholder="Entrez le nom du produit"
              type="textArea"
            />
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            Ajouter le produit
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddProduct;
