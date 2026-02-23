"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useState } from "react";

import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useConvex } from "convex/react";

import { DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { IUnknown } from "@/interface/Iunknown";
import {
  addInventoriesSchema,
  AddInventoriesSchemaType,
} from "@/schemas/inventories/inventories.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";

interface AddInventoryProps {
  callback?: () => void;
}

type FormSchemaPlusProductIdType = AddInventoriesSchemaType & {
  productId: string;
};

const AddInventory: FC<AddInventoryProps> = ({ callback }) => {
  const convex = useConvex();
  const { mutate, isPending } = useMutationWithToast(
    api.functions.inventories.create
  );
  const { userRole } = usePermission();
  const { typeOptions, brandOptions, colorOptions, sizeOptions } =
    useProductAttributes();

  const [isOpened, setOpened] = useState(false);
  const [inventory, setInventory] = useState<FormSchemaPlusProductIdType[]>([]);

  const form = useForm<AddInventoriesSchemaType>({
    resolver: zodResolver(addInventoriesSchema),
  });
  const typeValue = form.watch("type");

  function callbackOnSuccess() {
    form.reset();
    setOpened(false);
    setInventory([]);
    callback?.();
  }

  const handleSubmit = () => {
    mutate(
      {
        items: inventory.map((inv) => ({
          productId: inv.productId as any,
          quantity: inv.quantity,
          price: inv.price,
        })),
      },
      {
        successMessage: "Stock ajouté avec succès",
        onSuccess: callbackOnSuccess,
      }
    );
  };

  async function onAddInventory(values: AddInventoriesSchemaType) {
    const product = await convex.query(
      api.functions.products.findByAttributes,
      {
        type: values.type,
        brand: values.brand,
        color: values.color,
        size: values.size,
        ...(typeValue?.includes("polo") && values.collarColor
          ? { collarColor: values.collarColor }
          : {}),
      }
    );

    if (!product) {
      toast.error("Produit non trouvé");
      return;
    }

    if (inventory.find((item) => item.productId === product._id)) {
      toast.error("Ce produit est déjà dans l'inventaire");
      return;
    }
    form.reset();

    setInventory([...inventory, { ...values, productId: product._id }]);
  }

  const handleRemoveFromInventory = (index: number) => {
    const updatedInventory = [...inventory];
    updatedInventory.splice(index, 1);
    setInventory(updatedInventory);
  };

  const handleEditFromInventory = (index: number) => {
    const updatedInventory = [...inventory];
    const inventoryItem = updatedInventory[index];

    form.setValue("type", inventoryItem.type);
    form.setValue("brand", inventoryItem.brand);
    form.setValue("color", inventoryItem.color);
    form.setValue("size", inventoryItem.size);
    form.setValue("collarColor", inventoryItem.collarColor);
    // @ts-ignore
    form.setValue("quantity", inventoryItem.quantity.toString());
    // @ts-ignore
    form.setValue("price", inventoryItem.price.toString());

    updatedInventory.splice(index, 1);
    setInventory(updatedInventory);
  };

  return (
    <Modal
      title="Ajouter du stock"
      description=""
      onClose={() => setOpened(false)}
      isOpened={isOpened}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
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
            Ajouter du stock
          </Button>
        )
      }
    >
      <Form {...form}>
        <form
          className="grid gap-4 py-4 rounded-lg border p-6"
          onSubmit={form.handleSubmit(onAddInventory)}
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
            <SelectInput
              control={form.control}
              name="color"
              label="Couleur"
              placeholder="Sélectionnez les couleurs"
              options={colorOptions}
            />
          </div>
          <div className="grid gap-1">
            <SelectInput
              control={form.control}
              name="size"
              label="Taille"
              placeholder="Sélectionnez les tailles"
              options={sizeOptions}
            />
          </div>

          {typeValue?.includes("polo") && (
            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="collarColor"
                label="Couleur de la colle"
                placeholder="Sélectionnez les couleurs"
                options={colorOptions}
              />
            </div>
          )}

          <div className="mb-2 grid grid-cols-2 gap-4">
            <div className="grid gap-1">
              <Input
                control={form.control}
                name="quantity"
                label="Quantité"
                type="number"
                placeholder="Entrez la quantité"
              />
            </div>
            <div className="grid gap-1">
              <Input
                control={form.control}
                name="price"
                label="Prix"
                type="number"
                placeholder="Entrez le prix"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" loading={isPending}>
            Ajouter
          </Button>
        </form>
      </Form>

      <div className="overflow-hidden rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center">Type</TableHead>
              <TableHead className="text-center">Marque</TableHead>
              <TableHead className="text-center">Couleur</TableHead>
              <TableHead className="text-center">Taille</TableHead>
              <TableHead className="text-center">Quantité</TableHead>
              <TableHead className="text-center">Prix</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.map((item, index) => (
              <TableRow key={index} onClick={() => null}>
                <TableCell className="text-center">{item.type}</TableCell>
                <TableCell className="text-center">{item.brand}</TableCell>
                <TableCell className="text-center">{item.color}</TableCell>
                <TableCell className="text-center">{item.size}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center">{item.price}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => handleEditFromInventory(index)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => handleRemoveFromInventory(index)}
                  >
                    <Trash className="text-red-500" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <div className="flex gap-2">
          <Button
            className="w-full"
            disabled={isPending}
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              setInventory([]);
            }}
          >
            Annuler
          </Button>
        </div>
      </DialogFooter>
    </Modal>
  );
};

export default AddInventory;
