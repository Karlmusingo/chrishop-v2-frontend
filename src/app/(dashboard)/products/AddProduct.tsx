"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useEffect, useMemo, useState } from "react";
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
    api.functions.products.create,
  );
  const { userRole } = usePermission();
  const { types, brands, sizes, typeOptions, colorOptions } =
    useProductAttributes();

  const [isOpened, setOpened] = useState(false);

  const form = useForm<AddProductSchemaType>({
    resolver: zodResolver(addProductSchema),
  });
  const typeValue = form.watch("type");
  const codeValue = form.watch("code");
  const ageCategoryValue = form.watch("ageCategory");

  // Filter brands by selected type
  const filteredBrandOptions = useMemo(() => {
    if (!typeValue) return brands.map((b) => ({ label: b.value, value: b.value }));
    const selectedType = types.find((t) => t.value === typeValue);
    if (!selectedType) return brands.map((b) => ({ label: b.value, value: b.value }));
    return brands
      .filter((b) => b.typeId === selectedType._id || !b.typeId)
      .map((b) => ({ label: b.value, value: b.value }));
  }, [typeValue, types, brands]);

  // Filter sizes by selected ageCategory
  const filteredSizeOptions = useMemo(() => {
    if (!ageCategoryValue) return sizes.map((s) => ({ label: s.value, value: s.value }));
    return sizes
      .filter((s) => s.ageCategory === ageCategoryValue)
      .map((s) => ({ label: s.value, value: s.value }));
  }, [ageCategoryValue, sizes]);

  // Reset brand when type changes
  useEffect(() => {
    form.setValue("brand", "");
  }, [typeValue]);

  // Reset size selection when ageCategory changes
  useEffect(() => {
    form.setValue("size", []);
  }, [ageCategoryValue]);

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
      },
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
                options={filteredBrandOptions}
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Input
              control={form.control}
              name="code"
              label="Code"
              placeholder="Entrez le code du produit"
            />
          </div>

          <div
            className={`grid gap-4${typeValue?.toLowerCase()?.includes("polo") ? " grid-cols-2" : ""}`}
          >
            <div className="grid gap-1">
              <MultiSelect
                control={form.control}
                name="color"
                label="Couleur"
                placeholder="Sélectionnez les couleurs"
                options={colorOptions}
              />
            </div>

            {typeValue?.toLowerCase()?.includes("polo") && (
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
          </div>
          {!codeValue && (
            <>
              <div className="grid gap-1">
                <SelectInput
                  control={form.control}
                  name="ageCategory"
                  label="Catégorie"
                  placeholder="Adulte / Enfant"
                  options={[
                    { label: "Adulte", value: "adult" },
                    { label: "Enfant", value: "child" },
                  ]}
                />
              </div>
              <div className="grid gap-1">
                <MultiSelect
                  control={form.control}
                  name="size"
                  label="Taille"
                  placeholder="Sélectionnez les tailles"
                  options={filteredSizeOptions}
                />
              </div>
            </>
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
