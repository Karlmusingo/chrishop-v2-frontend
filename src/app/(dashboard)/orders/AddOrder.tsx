"use client";
import { Form } from "@/components/ui/form";

import SelectInput from "@/components/custom/SelectInput";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Modal from "@/components/ui/modal";
import Button from "@/components/custom/Button";
import Input from "@/components/custom/form/Input";

import { FC, useEffect, useState } from "react";

import { usePermission } from "@/hooks/usePermission";
import { ROLES } from "@/interface/roles";
import { useConvex, useQuery } from "convex/react";

import { DialogFooter } from "@/components/ui/dialog";
import {
  Select as SelectUI,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
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
  addOrderSchema,
  AddOrderSchemaType,
} from "@/schemas/orders/orders.schema";
import { useMutationWithToast } from "@/hooks/convex/useMutationWithToast";
import { api } from "../../../../convex/_generated/api";
import { useProductAttributes } from "@/hooks/convex/useProductAttributes";

interface AddOrderProps {
  callback?: () => void;
  orderData?: IUnknown;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  moveToNext?: (data?: IUnknown) => void;
}

type FormSchemaPlusProductIdType = AddOrderSchemaType & {
  productId: string;
  price: number;
  total: number;
};

const AddOrder: FC<AddOrderProps> = ({
  callback,
  orderData,
  isOpen,
  setIsOpen,
  moveToNext,
}) => {
  const convex = useConvex();
  const { mutate: createMutate, isPending } = useMutationWithToast(
    api.functions.orders.create,
  );
  const { mutate: updateMutate, isPending: isPendingUpdate } =
    useMutationWithToast(api.functions.orders.update);
  const { data: profile } = usePermission();
  const isAdmin = profile?.role === ROLES.ADMIN;
  const locations =
    useQuery(api.functions.locations.list, isAdmin ? {} : "skip") ?? [];
  const { typeOptions, brandOptions, colorOptions, sizeOptions } =
    useProductAttributes();

  const [orders, setOrders] = useState<FormSchemaPlusProductIdType[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(
    null,
  );

  const form = useForm<AddOrderSchemaType>({
    resolver: zodResolver(addOrderSchema),
  });
  const typeValue = form.watch("type");

  useEffect(() => {
    if (orderData && orderData.orderItems) {
      setOrders(
        orderData.orderItems.map((item: any) => ({
          ...item,
          type: item.product.type,
          brand: item.product.brand,
          color: item.product.color,
          size: item.product.size,
          quantity: item.quantity,
          collarColor: item.product.collarColor,

          productId: item.productId,
          price: item.unitPrice,
          total: item.totalPrice,
        })),
      );
    }
  }, [orderData]);

  function callbackOnSuccess(data?: IUnknown) {
    form.reset();
    moveToNext?.(data);
    callback?.();
  }

  const getLocationId = () => {
    return isAdmin ? selectedLocationId : profile?.locationId;
  };

  const handleSubmit = () => {
    const locationId = getLocationId();
    if (!locationId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    if (orderData?._id) {
      return updateMutate(
        {
          id: orderData._id as any,
          items: orders.map((item) => ({
            productId: item.productId as any,
            quantity: item.quantity,
          })),
          userId: profile._id as any,
          locationId: locationId as any,
        },
        {
          successMessage: "Commande mise à jour avec succès",
          onSuccess: callbackOnSuccess,
        },
      );
    }

    createMutate(
      {
        items: orders.map((item) => ({
          productId: item.productId as any,
          quantity: item.quantity,
        })),
        userId: profile._id as any,
        locationId: locationId as any,
      },
      {
        successMessage: "Commande créée avec succès",
        onSuccess: callbackOnSuccess,
      },
    );
  };

  async function onAddOrder(values: AddOrderSchemaType) {
    const locationId = getLocationId();
    if (!locationId) {
      toast.error("Veuillez sélectionner une boutique");
      return;
    }

    const inventory = await convex.query(
      api.functions.inventories.findByProductAttributes,
      {
        type: values.type,
        brand: values.brand,
        color: values.color,
        size: values.size,
        ...(typeValue?.includes("polo") && values.collarColor
          ? { collarColor: values.collarColor }
          : {}),
        locationId: locationId as any,
      },
    );

    if (!inventory || inventory.quantity <= 0) {
      toast.error("Ce produit n'a pas d'inventaire");
      return;
    }

    if (orders.find((item) => item.productId === inventory.productId)) {
      toast.error("Ce produit est déjà dans la liste");
      return;
    }

    if (inventory.quantity < values.quantity) {
      toast.error(
        "Quantité insuffisante, quantité disponible: " + inventory.quantity,
      );
      return;
    }

    setOrders([
      ...orders,
      {
        ...values,
        productId: inventory.productId,
        price: inventory.price,
        total: (inventory.price ?? 1) * values.quantity,
      },
    ]);
  }

  const handleRemoveFromOrders = (index: number) => {
    const updatedInventory = [...orders];
    updatedInventory.splice(index, 1);
    setOrders(updatedInventory);
  };

  const handleEditOrder = (index: number) => {
    const updatedOrder = [...orders];
    const orderItem = updatedOrder[index];

    form.setValue("type", orderItem.type);
    form.setValue("brand", orderItem.brand);
    form.setValue("color", orderItem.color);
    form.setValue("size", orderItem.size);
    form.setValue("collarColor", orderItem.collarColor);
    // @ts-ignore
    form.setValue("quantity", orderItem.quantity.toString());

    updatedOrder.splice(index, 1);
    setOrders(updatedOrder);
  };

  const totalSize = orders.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <Modal
      title="Ajouter une vente"
      description=""
      onClose={() => setIsOpen(false)}
      isOpened={isOpen}
      classNames={{
        title: "text-2xl font-semibold",
        description: "text-sm",
        container: "w-full max-h-[90vh] overflow-y-auto sm:max-w-[700px]",
      }}
      trigger={
        <Button
          icon="Plus"
          type="button"
          disabled={!profile?.location && profile?.role !== "ADMIN"}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          Ajouter une vente
        </Button>
      }
    >
      {isAdmin && (
        <div className="grid gap-1 mb-4">
          <Label>Boutique</Label>
          <SelectUI
            value={selectedLocationId ?? undefined}
            onValueChange={(val) => {
              setSelectedLocationId(val);
              setOrders([]);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez une boutique" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((loc: any) => (
                <SelectItem key={loc._id} value={loc._id}>
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectUI>
        </div>
      )}

      <Form {...form}>
        <form
          className="grid gap-4 py-4 rounded-lg border p-6"
          onSubmit={form.handleSubmit(onAddOrder)}
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

          <div className={`grid gap-4${typeValue?.includes("polo") ? " grid-cols-2" : ""}`}>
            <div className="grid gap-1">
              <SelectInput
                control={form.control}
                name="color"
                label="Couleur"
                placeholder="Sélectionnez les couleurs"
                options={colorOptions}
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

          <div className="mb-2 grid gap-1">
            <Input
              control={form.control}
              name="quantity"
              label="Quantité"
              type="number"
              placeholder="Entrez la quantité"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || isPendingUpdate}
          >
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
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((item, index) => (
              <TableRow key={index} onClick={() => null}>
                <TableCell className="text-center">{item.type}</TableCell>
                <TableCell className="text-center">{item.brand}</TableCell>
                <TableCell className="text-center">{item.color}</TableCell>
                <TableCell className="text-center">{item.size}</TableCell>
                <TableCell className="text-center">{item.quantity}</TableCell>
                <TableCell className="text-center">{item.price}</TableCell>
                <TableCell className="text-center">{item.total}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="link"
                    size="sm"
                    className="px-2"
                    onClick={() => handleEditOrder(index)}
                  >
                    <Pencil className="text-gray-500" size={16} />
                  </Button>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0"
                    onClick={() => handleRemoveFromOrders(index)}
                  >
                    <Trash className="text-red-500" size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-gray-100 hover:bg-gray-100">
              <TableCell className="text-center font-bold">Total</TableCell>
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center" />
              <TableCell className="text-center font-bold">
                {totalSize}
              </TableCell>
              <TableCell className="text-right" />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      <DialogFooter>
        <div className="flex gap-2">
          <Button
            className="w-full"
            loading={isPending || isPendingUpdate}
            onClick={() => handleSubmit()}
          >
            Enregistrer
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              form.reset();
              setOrders([]);
            }}
          >
            Annuler
          </Button>
        </div>
      </DialogFooter>
    </Modal>
  );
};

export default AddOrder;
