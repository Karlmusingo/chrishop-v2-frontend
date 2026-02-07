"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useEffect } from "react";
import { ProductType } from "@/constants/productType";
import { ProductBrand } from "@/constants/productBrand";
import { ProductColors } from "@/constants/colors";
import { ProductSize } from "@/constants/sizes";

import { toOptions } from "@/lib/toOptions";

import { IUnknown } from "@/interface/Iunknown";
import {
  addExistingInventoriesSchema,
  AddExistingInventoriesSchemaType,
} from "@/schemas/inventories/addInventories.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";

interface AddExistingInventoryProps {
  callback?: () => void;
  inventoryData: IUnknown;
  isOpen?: boolean;
  onClose: () => void;
}

const AddExistingInventory: FC<AddExistingInventoryProps> = ({
  callback,
  onClose,
  inventoryData,
  isOpen = false,
}) => {
  const { mutate, isPending } = useMutationWithToast(
    api.functions.inventories.add
  );

  const form = useForm<AddExistingInventoriesSchemaType>({
    resolver: zodResolver(addExistingInventoriesSchema),
  });
  const typeValue = form.watch("type");

  function callbackOnSuccess() {
    form.reset();
    onClose();
    callback?.();
  }

  const handleSubmit = (values: AddExistingInventoriesSchemaType) => {
    mutate(
      {
        id: inventoryData?._id as any,
        quantity: values.addQuantity,
      },
      {
        successMessage: "Inventory added successfully",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  useEffect(() => {
    form.setValue("type", inventoryData?.product?.type);
    form.setValue("brand", inventoryData?.product?.brand);
    form.setValue("color", inventoryData?.product?.color);
    form.setValue("size", inventoryData?.product?.size);
    form.setValue(
      "collarColor",
      inventoryData?.product?.collarColor || undefined
    );
    // @ts-ignore
    form.setValue("quantity", inventoryData?.quantity?.toString());
    // @ts-ignore
    form.setValue("price", inventoryData?.price?.toString());
  }, [inventoryData]);

  return (
    <Modal
      title="Ajouter du stock"
      description=""
      onClose={() => onClose?.()}
      isOpened={isOpen || false}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
      }}
    >
      <Form {...form}>
        <form
          className="grid gap-4 py-4 rounded-lg border p-6"
          onSubmit={form.handleSubmit(handleSubmit)}
        >
          <div className=" grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="type"
                label="Type"
                placeholder="Sélectionnez un type"
                disabled
                options={toOptions(Object.values(ProductType))}
              />
            </div>

            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="brand"
                label="Marque"
                disabled
                placeholder="Sélectionnez une marque"
                options={toOptions(Object.values(ProductBrand))}
              />
            </div>
          </div>

          <div className=" grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="color"
                label="Couleur"
                disabled
                placeholder="Sélectionnez les couleurs"
                options={toOptions(Object.values(ProductColors))}
              />
            </div>

            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="size"
                label="Taille"
                disabled
                placeholder="Sélectionnez les tailles"
                options={toOptions(Object.values(ProductSize))}
              />
            </div>
          </div>

          {typeValue?.includes("polo") && (
            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="collarColor"
                label="Couleur de la colle"
                placeholder="Sélectionnez les couleurs"
                options={toOptions(Object.values(ProductColors))}
                disabled
              />
            </div>
          )}

          <div className=" grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Input
                control={form.control}
                name="price"
                label="Prix"
                type="number"
                disabled
                placeholder="Entrez le prix"
              />
            </div>
            <div className="grid gap-1">
              <Input
                control={form.control}
                name="quantity"
                label="Quantité"
                type="number"
                disabled
                placeholder="Entrez la quantité"
              />
            </div>
          </div>

          <div className="grid gap-1">
            <Input
              control={form.control}
              name="addQuantity"
              label="Quantité à tranferer"
              type="number"
              placeholder="Entrez la quantité"
            />
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            Ajouter
          </Button>
        </form>
      </Form>
    </Modal>
  );
};

export default AddExistingInventory;
